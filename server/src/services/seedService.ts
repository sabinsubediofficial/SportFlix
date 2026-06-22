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

    let playlist = await prisma.playlist.findFirst({
      where: { url: 'static-seed' }
    });

    if (!playlist) {
      playlist = await prisma.playlist.create({
        data: {
          name: 'World Cup & Global Sports (Core)',
          url: 'static-seed',
          userId: user.id
        }
      });
    }

    const seedChannels = loadSeedChannels();
    if (seedChannels.length === 0) {
      console.warn('Seed channels list is empty or could not be loaded.');
      return;
    }

    console.log(`Synchronizing database with sports_channels_seed.json (${seedChannels.length} channels)...`);

    // Get all existing channels in this playlist
    const dbChannels = await prisma.channel.findMany({
      where: { playlistId: playlist.id }
    });

    const seedNames = seedChannels.map(c => c.name);

    // Delete channels that are no longer in the seed file
    let deletedCount = 0;
    for (const dbCh of dbChannels) {
      if (!seedNames.includes(dbCh.name)) {
        await prisma.channel.delete({
          where: { id: dbCh.id }
        });
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`Deleted ${deletedCount} obsolete channels from database.`);
    }

    // Upsert channels from seed file
    let addedCount = 0;
    let updatedCount = 0;
    for (const ch of seedChannels) {
      const exists = dbChannels.find(dbCh => dbCh.name === ch.name);
      if (exists) {
        // Update if properties changed
        if (
          exists.streamUrl !== ch.streamUrl ||
          exists.logo !== ch.logo ||
          exists.groupTitle !== ch.groupTitle ||
          exists.status !== ch.status ||
          exists.popularity !== ch.popularity ||
          exists.tvgId !== ch.tvgId
        ) {
          await prisma.channel.update({
            where: { id: exists.id },
            data: {
              logo: ch.logo,
              streamUrl: ch.streamUrl,
              tvgId: ch.tvgId,
              groupTitle: ch.groupTitle || 'Sports',
              status: ch.status || 'unknown',
              popularity: ch.popularity || 0
            }
          });
          updatedCount++;
        }
      } else {
        // Insert new
        await prisma.channel.create({
          data: {
            name: ch.name,
            logo: ch.logo,
            groupTitle: ch.groupTitle || 'Sports',
            streamUrl: ch.streamUrl,
            tvgId: ch.tvgId,
            status: ch.status || 'unknown',
            popularity: ch.popularity || 0,
            playlistId: playlist.id
          }
        });
        addedCount++;
      }
    }

    console.log(`Database sync complete. Added: ${addedCount}, Updated: ${updatedCount}.`);
    
    // Recalculate popularity scores
    await recalculateAllPopularityScores();
  } catch (error) {
    console.error('Auto-seeding sync failed:', error);
  }
};
