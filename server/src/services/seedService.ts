import { PrismaClient } from '@prisma/client';
import { getSportsChannels, getPopularityScore } from './iptvApiService.js';

const prisma = new PrismaClient();

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
      console.log('No channels found. Auto-seeding SPORTS ONLY channels for World Cup...');
      
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
          name: 'World Cup & Global Sports',
          url: 'https://iptv-org.github.io/api/channels.json?category=sports',
          userId: user.id
        }
      });

      // Get exclusively sports channels
      const channels = await getSportsChannels(1000);
      
      const channelData = channels.map(c => ({
        ...c,
        playlistId: playlist.id
      }));

      await prisma.channel.createMany({
        data: channelData
      });

      console.log(`Successfully auto-seeded ${channels.length} Sports channels.`);
    } else {
      // Recalculate popularity scores for existing channels to apply updated logic
      await recalculateAllPopularityScores();
    }
  } catch (error) {
    console.error('Auto-seeding failed:', error);
  }
};

