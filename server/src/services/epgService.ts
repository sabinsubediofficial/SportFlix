import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import zlib from 'zlib';
import { promisify } from 'util';
import { fetchIptvApiGuides } from './iptvApiService.js';

const gunzip = promisify(zlib.gunzip);
const prisma = new PrismaClient();

const parseXmltvDate = (dateStr: string): Date => {
  // Format: YYYYMMDDHHmmss [+/-]HHmm
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const hour = parseInt(dateStr.substring(8, 10));
  const minute = parseInt(dateStr.substring(10, 12));
  const second = parseInt(dateStr.substring(12, 14));

  return new Date(Date.UTC(year, month, day, hour, minute, second));
};

export const syncEpgForChannel = async (channelId: string, tvgId: string) => {
  try {
    console.log(`Syncing EPG for channel ${channelId} (tvgId: ${tvgId})...`);
    
    // 1. Find guide for this tvgId
    const guides = (await fetchIptvApiGuides()) || [];
    const guide = guides.find((g: any) => g.channel === tvgId);
    
    if (!guide) {
      console.log(`No guide found for ${tvgId}`);
      return;
    }

    console.log(`Found guide URL: ${guide.url}`);

    // 2. Fetch guide data
    const response = await axios.get(guide.url, { responseType: 'arraybuffer', timeout: 15000 });
    let xmlData: string;

    if (guide.url.endsWith('.gz')) {
      const decompressed = await gunzip(response.data);
      xmlData = decompressed.toString();
    } else {
      xmlData = response.data.toString();
    }

    // 3. Parse XML
    const result = await parseStringPromise(xmlData);
    const programmes = result.tv?.programme;

    if (!programmes || !Array.isArray(programmes)) {
      console.log('No programmes found in guide.');
      return;
    }

    // 4. Transform and filter programmes for this channel
    const channelProgrammes = programmes.filter((p: any) => p.$ && p.$.channel === tvgId);

    const programData = channelProgrammes.map((p: any) => {
      const startStr = p.$.start;
      const endStr = p.$.stop;

      return {
        title: (p.title && p.title[0] && (p.title[0]._ || p.title[0])) || 'Unknown Program',
        description: p.desc && p.desc[0] ? (p.desc[0]._ || p.desc[0]) : null,
        startTime: parseXmltvDate(startStr),
        endTime: parseXmltvDate(endStr),
        channelId: channelId
      };
    });

    // 5. Save to DB
    await prisma.$transaction([
      prisma.program.deleteMany({ where: { channelId } }),
      prisma.program.createMany({ data: programData })
    ]);

    console.log(`Successfully synced ${programData.length} programs for ${channelId}`);
  } catch (error) {
    console.error(`EPG Sync failed for ${channelId}:`, error);
  }
};

export const syncAllEpg = async () => {
  try {
    // Take up to 100 channels to sync EPG
    const channels = await prisma.channel.findMany({
      where: { tvgId: { not: null } },
      take: 100
    });

    console.log(`Syncing EPG for ${channels.length} channels...`);

    // 1. Fetch guide mapping list once
    const guides = (await fetchIptvApiGuides()) || [];

    // 2. Map channels to guide URLs
    const urlToChannels = new Map<string, { id: string; tvgId: string; name: string }[]>();
    for (const channel of channels) {
      const guide = guides.find((g: any) => g.channel === channel.tvgId);
      if (guide && guide.url) {
        const list = urlToChannels.get(guide.url) || [];
        list.push({ id: channel.id, tvgId: channel.tvgId!, name: channel.name });
        urlToChannels.set(guide.url, list);
      }
    }

    console.log(`Grouped ${channels.length} channels into ${urlToChannels.size} unique EPG sources.`);

    // 3. Process each EPG source
    for (const [guideUrl, batch] of urlToChannels.entries()) {
      try {
        console.log(`Downloading EPG guide from: ${guideUrl} for ${batch.length} channels (${batch.map(b => b.name).join(', ')})`);
        
        const response = await axios.get(guideUrl, { 
          responseType: 'arraybuffer',
          timeout: 20000
        });

        let xmlData: string;
        if (guideUrl.endsWith('.gz')) {
          const decompressed = await gunzip(response.data);
          xmlData = decompressed.toString();
        } else {
          xmlData = response.data.toString();
        }

        // Parse XML
        const result = await parseStringPromise(xmlData);
        const programmes = result.tv?.programme;

        if (!programmes || !Array.isArray(programmes)) {
          console.log(`No programmes list found in guide: ${guideUrl}`);
          continue;
        }

        // Process each channel in the batch
        for (const channel of batch) {
          const channelProgrammes = programmes.filter((p: any) => p.$ && p.$.channel === channel.tvgId);
          if (channelProgrammes.length === 0) {
            continue;
          }

          const programData = channelProgrammes.map((p: any) => {
            const startStr = p.$.start;
            const endStr = p.$.stop;

            return {
              title: (p.title && p.title[0] && (p.title[0]._ || p.title[0])) || 'Unknown Program',
              description: p.desc && p.desc[0] ? (p.desc[0]._ || p.desc[0]) : null,
              startTime: parseXmltvDate(startStr),
              endTime: parseXmltvDate(endStr),
              channelId: channel.id
            };
          });

          // Write to DB in a transaction
          await prisma.$transaction([
            prisma.program.deleteMany({ where: { channelId: channel.id } }),
            prisma.program.createMany({ data: programData })
          ]);

          console.log(`Successfully synced ${programData.length} programs for channel: ${channel.name}`);
        }
      } catch (error: any) {
        console.error(`Failed to process EPG source ${guideUrl}:`, error.message);
      }
    }

    console.log('EPG synchronization complete.');
  } catch (error: any) {
    console.error('EPG sync failed:', error);
  }
};
