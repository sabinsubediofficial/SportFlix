import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const seedJsonPath = path.join(process.cwd(), 'src/data/sports_channels_seed.json');

const fakeChannelNames = [
  // Fake Telemundo feeds (news, soap operas, romance)
  "Telemundo Noticias California",
  "Telemundo Al Día",
  "Telemundo Al Dia",
  "Telemundo Accion",
  "Telemundo Noticias Ahora",
  "Telemundo Noticias Florida",
  "Telemundo Noticias Noreste",
  "Telemundo Romance",
  "Telemundo telenovelas clásicas",
  
  // Duplicate / offline premium entries
  "TELEMUNDO FHD",
  "TSN SPORTS FHD",
  "TSN SPORTS",
  "TSN SPORTS 3",
  "BBC One (720p)",
  "BBC Two HD (720p)",
  "ITV1 (1080p)",
  "SBS One (Australia)"
];

async function main() {
  if (!fs.existsSync(seedJsonPath)) {
    console.error('Seed file not found');
    return;
  }

  // 1. Clean sports_channels_seed.json
  const seedChannels = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
  console.log(`Original seed channel count: ${seedChannels.length}`);

  const filteredSeed = seedChannels.filter((c: any) => !fakeChannelNames.includes(c.name));
  fs.writeFileSync(seedJsonPath, JSON.stringify(filteredSeed, null, 2));
  console.log(`Cleaned seed channel count: ${filteredSeed.length}`);

  // 2. Delete from SQLite database
  let deletedCount = 0;
  for (const name of fakeChannelNames) {
    const dbChannel = await prisma.channel.findFirst({
      where: { name: name }
    });

    if (dbChannel) {
      await prisma.channel.delete({
        where: { id: dbChannel.id }
      });
      console.log(`Deleted fake channel from DB: "${name}"`);
      deletedCount++;
    }
  }

  console.log(`Cleanup complete. Deleted ${deletedCount} fake channels from the database.`);
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
