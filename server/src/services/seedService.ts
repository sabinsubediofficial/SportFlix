import { PrismaClient } from '@prisma/client';
import { getPopularityScore } from './iptvApiService.js';

const prisma = new PrismaClient();

const PREMIUM_CHANNELS = [
  {
    name: 'CazeTV',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/64/Caz%C3%A9TV_logo.svg/1280px-Caz%C3%A9TV_logo.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'https://dfr80qz435crc.cloudfront.net/MNOP/Amagi/Caze/Caze_TV_BR/Caze_TV.m3u8',
    tvgId: 'CazeTV.br',
    popularity: 1000,
    status: 'online'
  },
  {
    name: 'TRT 1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/TRT_1_logo_%282021-%29.svg/960px-TRT_1_logo_%282021-%29.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'https://tv-trt1.medya.trt.com.tr/master.m3u8',
    tvgId: null,
    popularity: 500,
    status: 'online'
  },
  {
    name: 'TVRI',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/TVRILogo2019.svg/960px-TVRILogo2019.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/Nasional/hls/Nasional.m3u8',
    tvgId: null,
    popularity: 250,
    status: 'online'
  },
  {
    name: 'TVRI Sport',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/TVRI_Sport_2022.svg/960px-TVRI_Sport_2022.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'https://ott-balancer.tvri.go.id/live/eds/SportHD/hls/SportHD.m3u8',
    tvgId: 'TVRISport.id',
    popularity: 300,
    status: 'online'
  },
  {
    name: 'Thai PBS',
    logo: 'https://i.imgur.com/CwalZjr.png',
    groupTitle: 'Sports',
    streamUrl: 'https://thaipbs-live.cdn.byteark.com/live/playlist.m3u8',
    tvgId: null,
    popularity: 200,
    status: 'online'
  },
  {
    name: 'Telemundo PR',
    logo: 'https://i.imgur.com/j2O4ndp.png',
    groupTitle: 'Sports',
    streamUrl: 'https://nbculocallive.akamaized.net/hls/live/2037499/puertorico/stream1/master.m3u8',
    tvgId: 'TelemundoPR',
    popularity: 800,
    status: 'online'
  },
  {
    name: 'NBCU Telemundo Florida',
    logo: 'https://i.imgur.com/j2O4ndp.png',
    groupTitle: 'Sports',
    streamUrl: 'https://nbcu-telemundoflorida-firetv.amagi.tv/playlist.m3u8',
    tvgId: 'TelemundoFL',
    popularity: 800,
    status: 'online'
  },
  {
    name: 'Das Erste HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/ARD_Dachmarke_2014.svg/960px-ARD_Dachmarke_2014.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'https://daserste-live.ard-mcdn.de/daserste/live/hls/int/master.m3u8',
    tvgId: 'DasErste',
    popularity: 700,
    status: 'online'
  },
  {
    name: 'ZDF HD',
    logo: 'https://i.imgur.com/rtLb6m9.png',
    groupTitle: 'Sports',
    streamUrl: 'https://zdf-hls-15.akamaized.net/hls/live/2016498/de/high/master.m3u8',
    tvgId: 'ZDF',
    popularity: 700,
    status: 'online'
  },
  {
    name: 'RTP 1 HD',
    logo: 'https://cdn-images.rtp.pt/common/img/channels/logos/color/horizontal/rtp1_2026.png',
    groupTitle: 'Sports',
    streamUrl: 'https://streaming-live.rtp.pt/liverepeater/rtp1HD.smil/playlist.m3u8',
    tvgId: 'RTP1',
    popularity: 600,
    status: 'online'
  },
  {
    name: 'BBC One (720p)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BBC_One_logo_2021.svg/960px-BBC_One_logo_2021.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'http://92.114.85.72:8000/play/a0mp',
    tvgId: 'BBC1.uk',
    popularity: 900,
    status: 'offline'
  },
  {
    name: 'BBC Two HD (720p)',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/BBC_Two_logo_2021.svg/960px-BBC_Two_logo_2021.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'https://streamer.nexyl.uk/69ef899e-8ca9-4537-9f1a-fe8b4216afbb.m3u8',
    tvgId: 'BBC2.uk',
    popularity: 600,
    status: 'offline'
  },
  {
    name: 'ITV1 (1080p)',
    logo: 'https://i.imgur.com/xwPekCF.png',
    groupTitle: 'Sports',
    streamUrl: 'http://80.194.62.172:50002/stream/channelid/95929545',
    tvgId: 'ITV1.uk',
    popularity: 900,
    status: 'offline'
  },
  {
    name: 'ITV (480p)',
    logo: 'https://i.imgur.com/YlDFir7.jpg',
    groupTitle: 'Sports',
    streamUrl: 'https://cdn10.live-tv.cloud/itvrv/abr-lq/playlist.m3u8',
    tvgId: 'ITV.uk',
    popularity: 700,
    status: 'online'
  },
  {
    name: 'TSN The Ocho',
    logo: 'https://i.imgur.com/2JzlorD.png',
    groupTitle: 'Sports',
    streamUrl: 'https://d3pnbvng3bx2nj.cloudfront.net/v1/master/3722c60a815c199d9c0ef36c5b73da68a62b09d1/cc-rds8g35qfqrnv/TSN_The_Ocho.m3u8',
    tvgId: 'TSNTheOcho.ca',
    popularity: 500,
    status: 'online'
  },
  {
    name: 'T Sports',
    logo: 'https://i.imgur.com/2JzlorD.png',
    groupTitle: 'Sports',
    streamUrl: 'https://tvsen7.aynaott.com/tsports-hd/index.m3u8',
    tvgId: 'TSports.bd',
    popularity: 400,
    status: 'online'
  },
  {
    name: 'ESPN Deportes',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/ESPN_Deportes.svg/960px-ESPN_Deportes.svg.png',
    groupTitle: 'Sports',
    streamUrl: 'http://Tdo@origin.thetvapp.to/hls/espn-deportes/mono.m3u8',
    tvgId: 'ESPNDeportes.us',
    popularity: 1000,
    status: 'offline'
  },
  {
    name: 'Fox Deportes',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/FOX_Deportes_logo.png/960px-FOX_Deportes_logo.png',
    groupTitle: 'Sports',
    streamUrl: 'https://cors-proxy.cooks.fyi/http://23.237.104.106:8080/USA_FOX_DEPORTES/index.m3u8',
    tvgId: 'FoxDeportes.us',
    popularity: 800,
    status: 'online'
  },
  {
    name: 'ITV Deportes',
    logo: 'https://iili.io/J1kV1Bn.png',
    groupTitle: 'Sports',
    streamUrl: 'https://thm-it-roku.otteravision.com/thm/it/it.m3u8',
    tvgId: 'ITVDeportes.mx',
    popularity: 500,
    status: 'online'
  }
];

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

      const channelData = PREMIUM_CHANNELS.map(c => ({
        ...c,
        playlistId: playlist.id
      }));

      await prisma.channel.createMany({
        data: channelData
      });

      console.log(`Successfully auto-seeded ${PREMIUM_CHANNELS.length} premium Sports channels.`);
    } else {
      // Recalculate popularity scores for existing channels to apply updated logic
      await recalculateAllPopularityScores();
    }
  } catch (error) {
    console.error('Auto-seeding failed:', error);
  }
};
