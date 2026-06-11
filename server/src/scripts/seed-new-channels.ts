import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const seedMissingChannels = async () => {
  try {
    const filePath = path.join(process.cwd(), 'src/data/sports_channels_seed.json');
    if (!fs.existsSync(filePath)) {
      console.error(`Seed file not found: ${filePath}`);
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const seedChannels = JSON.parse(fileContent);

    console.log(`Loaded ${seedChannels.length} channels from seed JSON.`);

    // Find our main playlist
    let playlist = await prisma.playlist.findFirst({
      where: { url: 'static-seed' }
    });

    if (!playlist) {
      console.log('Main playlist not found, creating one...');
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
      playlist = await prisma.playlist.create({
        data: {
          name: 'World Cup & Global Sports (Core)',
          url: 'static-seed',
          userId: user.id
        }
      });
    }

    let addedCount = 0;
    for (const channel of seedChannels) {
      const exists = await prisma.channel.findFirst({
        where: { name: channel.name }
      });

      if (!exists) {
        await prisma.channel.create({
          data: {
            name: channel.name,
            logo: channel.logo,
            groupTitle: channel.groupTitle || 'Sports',
            streamUrl: channel.streamUrl,
            tvgId: channel.tvgId,
            status: channel.status || 'unknown',
            popularity: channel.popularity || 0,
            playlistId: playlist.id
          }
        });
        console.log(`Added missing channel: ${channel.name}`);
        addedCount++;
      }
    }

    console.log(`Seed check complete. Added ${addedCount} new channels.`);
  } catch (error) {
    console.error('Failed to seed missing channels:', error);
  } finally {
    await prisma.$disconnect();
  }
};

seedMissingChannels();
