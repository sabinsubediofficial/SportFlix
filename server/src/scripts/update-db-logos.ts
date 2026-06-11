import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const seedJsonPath = path.join(process.cwd(), 'src/data/sports_channels_seed.json');

async function main() {
  if (!fs.existsSync(seedJsonPath)) {
    console.error('Seed file not found:', seedJsonPath);
    return;
  }

  const seedChannels = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
  console.log(`Loaded ${seedChannels.length} channels from seed JSON.`);

  let updatedCount = 0;
  for (const channel of seedChannels) {
    if (channel.logo && channel.logo !== '') {
      // Find the channel in the database by name
      const dbChannel = await prisma.channel.findFirst({
        where: { name: channel.name }
      });

      if (dbChannel && dbChannel.logo !== channel.logo) {
        await prisma.channel.update({
          where: { id: dbChannel.id },
          data: { logo: channel.logo }
        });
        console.log(`Updated database logo for "${channel.name}" to: ${channel.logo}`);
        updatedCount++;
      }
    }
  }

  console.log(`Database update complete. Updated logos for ${updatedCount} channels.`);
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
