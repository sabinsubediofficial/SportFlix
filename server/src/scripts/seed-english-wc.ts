import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const seedJsonPath = path.join(process.cwd(), 'src/data/sports_channels_seed.json');

const newChannels = [
  {
    name: "FOX (Local NY WNYW)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/WNYW_logo_2020.svg/200px-WNYW_logo_2020.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://aegis-cloudfront-1.tubi.video/36a435c5-f70a-411a-b237-e32738c486a8/index.m3u8",
    tvgId: "WNYW51.us",
    status: "online",
    popularity: 100
  },
  {
    name: "FOX (Local LA KTTV)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/ed/KTTV_Fox_11_logo_2020.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://aegis-cloudfront-1.tubi.video/317a6700-b890-4066-a2e7-dea5c15fd915/index.m3u8",
    tvgId: "KTTV111.us",
    status: "online",
    popularity: 100
  },
  {
    name: "FOX (Local SF KTVU)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/00/KTVU_Fox_2_logo_2021.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://aegis-cloudfront-1.tubi.video/8d9284ec-c451-4e51-a1d4-d16e5c8972af/index.m3u8",
    tvgId: "KTVU41.us",
    status: "online",
    popularity: 100
  },
  {
    name: "FOX Sports 1 (FS1)",
    logo: "https://i.imgur.com/O9BapV9.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://cors-proxy.cooks.fyi/http://190.11.225.124:5000/live/fs1_hd/playlist.m3u8",
    tvgId: "FoxSports1.us",
    status: "online",
    popularity: 100
  },
  {
    name: "FOX Sports 2",
    logo: "https://i.imgur.com/LHtxKI8.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://tvsen7.aynaott.com/foxsports2/index.m3u8",
    tvgId: "FoxSports2.us",
    status: "online",
    popularity: 100
  },
  {
    name: "BBC One",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BBC_One_logo_2021.svg/640px-BBC_One_logo_2021.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://vs-hls-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_yorks/iptv_hd_abr_v1.m3u8",
    tvgId: "BBCOne.uk",
    status: "online",
    popularity: 100
  },
  {
    name: "BBC Two",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/BBC_Two_logo_2021.svg/640px-BBC_Two_logo_2021.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://vs-hls-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_hd/iptv_hd_abr_v1.m3u8",
    tvgId: "BBCTwo.uk",
    status: "online",
    popularity: 100
  },
  {
    name: "ITV1",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/ITV_logo_2021.svg/640px-ITV_logo_2021.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://cdn10.live-tv.cloud/itvrv/abr-lq/playlist.m3u8",
    tvgId: "ITV1.uk",
    status: "online",
    popularity: 100
  },
  {
    name: "TSN Canada",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/TSN_Logo_2015.svg/640px-TSN_Logo_2015.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://d3pnbvng3bx2nj.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-rds8g35qfqrnv/TSN_The_Ocho.m3u8",
    tvgId: "TSN.ca",
    status: "online",
    popularity: 100
  },
  {
    name: "CTV Toronto",
    logo: "https://i.imgur.com/qOutOWN.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://bozztv.com/teleyupp1/teleup-zxsJFt6VvY/playlist.m3u8",
    tvgId: "CTV.ca",
    status: "online",
    popularity: 100
  },
  {
    name: "SBS Australia",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/SBS_logo.svg/640px-SBS_logo.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "sbs.au",
    status: "online",
    popularity: 100
  },
  {
    name: "SBS Viceland",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/SBS_Viceland_logo.svg/640px-SBS_Viceland_logo.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "sbsviceland.au",
    status: "online",
    popularity: 100
  },
  {
    name: "RTÉ Two",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/RT%C3%892_logo_2014.svg/640px-RT%C3%892_logo_2014.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "rte2.ie",
    status: "online",
    popularity: 100
  },
  {
    name: "Virgin Media One",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Virgin_Media_One_logo.svg/640px-Virgin_Media_One_logo.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "virginmediaone.ie",
    status: "online",
    popularity: 100
  },
  {
    name: "SuperSport Football",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/SuperSport_logo.svg/640px-SuperSport_logo.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "supersportfootball.za",
    status: "online",
    popularity: 100
  },
  {
    name: "SuperSport Grandstand",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/SuperSport_logo.svg/640px-SuperSport_logo.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "supersportgrandstand.za",
    status: "online",
    popularity: 100
  },
  {
    name: "Sky Sport NZ",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Sky_logo_2020.svg/640px-Sky_logo_2020.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "skysport.nz",
    status: "online",
    popularity: 100
  },
  {
    name: "Now Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Now_TV_logo.svg/640px-Now_TV_logo.svg.png",
    groupTitle: "World Cup 2026",
    streamUrl: "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8",
    tvgId: "nowsports.hk",
    status: "online",
    popularity: 100
  }
];

async function main() {
  // 1. Update the JSON seed configuration
  let seedChannels = [];
  if (fs.existsSync(seedJsonPath)) {
    seedChannels = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
  }

  for (const ch of newChannels) {
    const idx = seedChannels.findIndex((c: any) => c.name === ch.name);
    if (idx !== -1) {
      seedChannels[idx] = ch; // update
    } else {
      seedChannels.push(ch); // insert
    }
  }

  fs.writeFileSync(seedJsonPath, JSON.stringify(seedChannels, null, 2));
  console.log(`Updated sports_channels_seed.json with ${newChannels.length} English World Cup channels.`);

  // 2. Update the Prisma database
  let playlist = await prisma.playlist.findFirst({
    where: { url: 'static-seed' }
  });

  if (!playlist) {
    console.log('Main static playlist not found, creating one...');
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

  let dbAdded = 0;
  let dbUpdated = 0;

  for (const ch of newChannels) {
    const exists = await prisma.channel.findFirst({
      where: { name: ch.name }
    });

    if (exists) {
      await prisma.channel.update({
        where: { id: exists.id },
        data: {
          logo: ch.logo,
          streamUrl: ch.streamUrl,
          tvgId: ch.tvgId,
          groupTitle: ch.groupTitle,
          status: ch.status,
          popularity: ch.popularity
        }
      });
      console.log(`Updated database channel: ${ch.name}`);
      dbUpdated++;
    } else {
      await prisma.channel.create({
        data: {
          name: ch.name,
          logo: ch.logo,
          groupTitle: ch.groupTitle,
          streamUrl: ch.streamUrl,
          tvgId: ch.tvgId,
          status: ch.status,
          popularity: ch.popularity,
          playlistId: playlist.id
        }
      });
      console.log(`Created database channel: ${ch.name}`);
      dbAdded++;
    }
  }

  console.log(`Seeding database complete. Added: ${dbAdded}, Updated: ${dbUpdated}.`);
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
