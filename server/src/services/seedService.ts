import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { getPopularityScore } from './iptvApiService.js';

const prisma = new PrismaClient();

// Load the 316 sports channels from the static JSON file
const loadSeedChannels = (): any[] => {
  try {
    const filePath = path.join(process.cwd(), 'src/data/sports_channels_seed.json');
    if (fs.existsSync(filePath)) {
      console.log(`Loading seed channels from static JSON: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (error) {
    console.error('Failed to load seed channels from JSON:', error);
  }
  return [];
};

export const recalculateAllPopularityScores = async () => {
  try {
    console.log('Updating database channels with new real-world popularity scores...');
    const channels = await prisma.channel.findMany({
      select: { id: true, name: true }
    });

    for (const channel of channels) {
      const score = getPopularityScore(channel.name);
      await prisma.channel.update({
        where: { id: channel.id },
        data: { popularity: score }
      });
    }
    console.log('Successfully updated all channel popularity scores.');
  } catch (error) {
    console.error('Failed to recalculate popularity scores:', error);
  }
};

export const autoSeedChannels = async () => {
  try {
    const channelCount = await prisma.channel.count();
    
    if (channelCount === 0) {
      console.log('No channels found. Auto-seeding core World Cup & Sports channels...');
      
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'sports@webtv.local',
            passwordHash: 'world-cup-2026',
            role: 'admin'
          }
        });
      }

      const playlist = await prisma.playlist.create({
        data: {
          name: 'World Cup & Global Sports (Core)',
          url: 'static-seed',
          userId: user.id
        }
      });

      const seedChannels = loadSeedChannels();
      if (seedChannels.length === 0) {
        console.warn('Seed channels list is empty or could not be loaded.');
        return;
      }

      const channelData = seedChannels.map(c => ({
        name: c.name,
        logo: c.logo,
        groupTitle: c.groupTitle || 'Sports',
        streamUrl: c.streamUrl,
        tvgId: c.tvgId,
        status: c.status || 'unknown',
        popularity: c.popularity || 0,
        playlistId: playlist.id
      }));

      // SQLite supports bulk inserts but createMany might have size limits in sqlite parameters.
      // 316 channels with 8 columns = ~2500 variables, which is safe (SQLite limit is 32766 variables).
      await prisma.channel.createMany({
        data: channelData
      });

      console.log(`Successfully auto-seeded ${seedChannels.length} Sports channels.`);
    } else {
      // Recalculate popularity scores for existing channels to apply updated logic
      await recalculateAllPopularityScores();
    }
  } catch (error) {
    console.error('Auto-seeding failed:', error);
  }
};
