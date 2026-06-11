import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Common browser user-agent to bypass basic bot blocks
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export const validateChannel = async (channelId: string, streamUrl: string) => {
  // 1. Try a fast HEAD request first
  try {
    const headResponse = await axios.head(streamUrl, {
      timeout: 4000,
      headers: { 
        'User-Agent': USER_AGENT,
        'Accept': '*/*'
      }
    });
    
    const contentType = String(headResponse.headers['content-type'] || '');
    const isValidType = 
      contentType.includes('mpegurl') || 
      contentType.includes('apple.mpegurl') || 
      contentType.includes('video/') || 
      contentType.includes('application/x-mpegURL') ||
      contentType.includes('application/vnd.apple.mpegurl');

    if (headResponse.status < 400 && isValidType) {
      console.log(`[WORKING HEAD] ${channelId} - ${contentType}`);
      try {
        await prisma.channel.update({
          where: { id: channelId },
          data: { 
            status: 'online',
            lastValidated: new Date()
          }
        });
      } catch (e: any) {
        if (e.code !== 'P2025') throw e;
      }
      return true;
    }
  } catch (error: any) {
    // HEAD failed or rejected, fall back to GET stream abort
  }

  // 2. Fallback: GET request with stream response type to inspect headers and immediately abort
  try {
    const response = await axios.get(streamUrl, {
      timeout: 6000,
      responseType: 'stream',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*'
      }
    });

    const contentType = String(response.headers['content-type'] || '');
    
    const isValidType = 
      contentType.includes('mpegurl') || 
      contentType.includes('apple.mpegurl') || 
      contentType.includes('video/') || 
      contentType.includes('application/x-mpegURL') ||
      contentType.includes('application/vnd.apple.mpegurl');

    // Immediately destroy the stream connection to stop downloading video data
    if (response.data && typeof response.data.destroy === 'function') {
      response.data.destroy();
    }

    if (response.status < 400 && isValidType) {
      console.log(`[WORKING GET STREAM] ${channelId} - ${contentType}`);
      try {
        await prisma.channel.update({
          where: { id: channelId },
          data: { 
            status: 'online',
            lastValidated: new Date()
          }
        });
      } catch (e: any) {
        if (e.code !== 'P2025') throw e;
      }
      return true;
    }
  } catch (error: any) {
    // GET failed
  }

  // If we reach here, it failed validation
  try {
    await prisma.channel.update({
      where: { id: channelId },
      data: { 
        status: 'offline',
        lastValidated: new Date()
      }
    });
  } catch (e: any) {
    if (e.code !== 'P2025') throw e;
  }
  return false;
};

export const purgeDeadChannels = async () => {
  console.log('Starting purge of confirmed dead channels...');
  const result = await prisma.channel.deleteMany({
    where: {
      status: 'offline'
    }
  });
  console.log(`Purged ${result.count} dead channels from the library.`);
  return result.count;
};

export const validateAllChannels = async (forceAll = false) => {
  // If not forceAll, we prioritize unknown or old validations (older than 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const where = forceAll ? {} : {
    OR: [
      { status: 'unknown' },
      { lastValidated: { lt: oneDayAgo } },
      { lastValidated: null }
    ]
  };

  const channels = await prisma.channel.findMany({ where });
  console.log(`Deep-checking health for ${channels.length} channels...`);

  const batchSize = 50; 
  for (let i = 0; i < channels.length; i += batchSize) {
    const batch = channels.slice(i, i + batchSize);
    console.log(`Deep Validation: Batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(channels.length / batchSize)}...`);
    
    await Promise.all(batch.map(channel => validateChannel(channel.id, channel.streamUrl)));
    
    // REMOVED: Immediate purge. We want users to see 'offline' status.
  }

  console.log('Channel health sync complete.');
};
