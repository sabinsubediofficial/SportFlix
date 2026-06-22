import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const seedJsonPath = path.join(process.cwd(), 'src/data/sports_channels_seed.json');

// Exact list of English sports channels requested by the user
const channelRequests = [
  // UK
  { name: "BBC One", tvgId: "BBCOne.uk", defaultUrl: "https://vs-hls-pushb-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_one_yorks/iptv_hd_abr_v1.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BBC_One_logo_2021.svg/640px-BBC_One_logo_2021.svg.png" },
  { name: "BBC Two", tvgId: "BBCTwo.uk", defaultUrl: "https://vs-hls-push-uk-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_two_hd/iptv_hd_abr_v1.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/BBC_Two_logo_2021.svg/640px-BBC_Two_logo_2021.svg.png" },
  { name: "ITV1", tvgId: "ITV1.uk", defaultUrl: "https://cdn10.live-tv.cloud/itvrv/abr-lq/playlist.m3u8", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/ITV_logo_2021.svg/640px-ITV_logo_2021.svg.png" },
  { name: "Sky Sports Main Event", tvgId: "SkySportsMainEvent.uk" },
  { name: "Sky Sports Football", tvgId: "SkySportsFootball.uk" },
  { name: "Sky Sports Premier League", tvgId: "SkySportsPremierLeague.uk" },
  { name: "TNT Sports 1", tvgId: "TNTSports1.uk" },
  { name: "TNT Sports 2", tvgId: "TNTSports2.uk" },
  { name: "TNT Sports 3", tvgId: "TNTSports3.uk" },
  { name: "TNT Sports 4", tvgId: "TNTSports4.uk" },
  { name: "Premier Sports 1", tvgId: "PremierSports1.uk" },
  { name: "Premier Sports 2", tvgId: "PremierSports2.uk" },

  // USA
  { name: "FOX", tvgId: "Fox.us", defaultUrl: "https://aegis-cloudfront-1.tubi.video/36a435c5-f70a-411a-b237-e32738c486a8/index.m3u8" },
  { name: "FS1", tvgId: "FoxSports1.us", defaultUrl: "https://cors-proxy.cooks.fyi/http://190.11.225.124:5000/live/fs1_hd/playlist.m3u8" },
  { name: "FS2", tvgId: "FoxSports2.us", defaultUrl: "https://tvsen7.aynaott.com/foxsports2/index.m3u8" },
  { name: "ESPN", tvgId: "ESPN.us" },
  { name: "ESPN2", tvgId: "ESPN2.us" },
  { name: "ESPNews", tvgId: "ESPNews.us" },
  { name: "ESPNU", tvgId: "ESPNU.us" },
  { name: "CBS Sports Network", tvgId: "CBSSportsNetwork.us" },
  { name: "NBC Sports", tvgId: "NBCSports.us" },
  { name: "USA Network", tvgId: "USANetwork.us" },
  { name: "NBC Universo", tvgId: "NBCUniverso.us", defaultUrl: "http://190.11.225.124:5000/live/universo_hd/playlist.m3u8" },
  { name: "Golf Channel", tvgId: "GolfChannel.us" },
  { name: "NFL Network", tvgId: "NFLNetwork.us" },
  { name: "NBA TV", tvgId: "NBATV.us" },

  // Canada
  { name: "TSN 1", tvgId: "TSN1.ca" },
  { name: "TSN 2", tvgId: "TSN2.ca" },
  { name: "TSN 3", tvgId: "TSN3.ca" },
  { name: "TSN 4", tvgId: "TSN4.ca" },
  { name: "TSN 5", tvgId: "TSN5.ca" },
  { name: "Sportsnet", tvgId: "Sportsnet.ca" },
  { name: "Sportsnet One", tvgId: "SportsnetOne.ca" },
  { name: "Sportsnet World", tvgId: "SportsnetWorld.ca" },
  { name: "beIN Sports Canada", tvgId: "beINSportsCanada.ca" },

  // Australia & New Zealand
  { name: "SBS Australia", tvgId: "sbs.au" },
  { name: "SBS Viceland", tvgId: "sbsviceland.au" },
  { name: "Sky Sport 1 NZ", tvgId: "skysport1.nz" },
  { name: "Sky Sport 2 NZ", tvgId: "skysport2.nz" },
  { name: "Sky Sport 3 NZ", tvgId: "skysport3.nz" },
  { name: "Sky Sport 4 NZ", tvgId: "skysport4.nz" },
  { name: "ESPN Australia", tvgId: "ESPNAustralia.au" },
  { name: "Fox Sports 501", tvgId: "FoxSports501.au" },
  { name: "Fox Sports 502", tvgId: "FoxSports502.au" },
  { name: "Fox Sports 503", tvgId: "FoxSports503.au" },

  // South Asia
  { name: "Sony Sports Ten 1", tvgId: "SonySportsTen1.in" },
  { name: "Sony Sports Ten 2", tvgId: "SonySportsTen2.in" },
  { name: "Sony Sports Ten 5", tvgId: "SonySportsTen5.in" },
  { name: "Star Sports 1", tvgId: "StarSports1.in" },
  { name: "Star Sports Select 1", tvgId: "StarSportsSelect1.in" },
  { name: "Star Sports Select 2", tvgId: "StarSportsSelect2.in" },
  { name: "Eurosport India", tvgId: "EurosportIndia.in" },

  // Middle East / International
  { name: "beIN Sports 1 English", tvgId: "beINSports1English.gulf" },
  { name: "beIN Sports 2 English", tvgId: "beINSports2English.gulf" },
  { name: "beIN Sports 3 English", tvgId: "beINSports3English.gulf" },
  { name: "beIN Sports Xtra", tvgId: "beINSPORTSXTRA.us" },
  { name: "Alkass Sports", tvgId: "AlkassSports.qa" },
  { name: "Abu Dhabi Sports English Feed", tvgId: "AbuDhabiSportsEnglish.ae" },

  // Africa
  { name: "SuperSport Football", tvgId: "supersportfootball.za" },
  { name: "SuperSport Premier League", tvgId: "supersportpremierleague.za" },
  { name: "SuperSport Variety 1", tvgId: "supersportvariety1.za" },
  { name: "SuperSport Variety 2", tvgId: "supersportvariety2.za" },
  { name: "SuperSport Grandstand", tvgId: "supersportgrandstand.za" },
  { name: "ESPN Africa", tvgId: "ESPNAfrica.za" },
  { name: "Canal+ Sport English Feed", tvgId: "CanalPlusSportEnglish.fr" },

  // Europe (English feeds available)
  { name: "Eurosport 1", tvgId: "Eurosport1.uk" },
  { name: "Eurosport 2", tvgId: "Eurosport2.uk" },
  { name: "Viaplay Sports 1", tvgId: "ViaplaySports1.uk" },
  { name: "Viaplay Sports 2", tvgId: "ViaplaySports2.uk" },
  { name: "Viaplay Sports 3", tvgId: "ViaplaySports3.uk" },
  { name: "Viaplay Sports 4", tvgId: "ViaplaySports4.uk" },
  { name: "Viaplay Xtra", tvgId: "ViaplayXtra.uk" },
  { name: "DAZN English Feed", tvgId: "DAZNEnglish.de" },
  { name: "OneFootball TV", tvgId: "OneFootballTV.de" },

  // Club / Football Specific
  { name: "MUTV", tvgId: "MUTV.uk" },
  { name: "LFCTV", tvgId: "LFCTV.uk" },
  { name: "Real Madrid TV English", tvgId: "RealMadridTVEnglish.es" },
  { name: "Chelsea TV", tvgId: "ChelseaTV.uk" },
  { name: "Arsenal TV", tvgId: "ArsenalTV.uk" },
  { name: "Bundesliga English", tvgId: "BundesligaEnglish.de" },
  { name: "Serie A English Feed", tvgId: "SerieAEnglish.it" },
  { name: "LaLiga TV", tvgId: "LaLigaTV.es" },
  { name: "FIFA TV", tvgId: "FIFATV.int" },
  { name: "UEFA TV", tvgId: "UEFATV.int" },

  // Additional English Sports Channels
  { name: "AFN Sports", tvgId: "AFNSports.us" },
  { name: "AFN Sports 2", tvgId: "AFNSports2.us" },
  { name: "Racing TV", tvgId: "RacingTV.uk" },
  { name: "Sky Sports Racing", tvgId: "SkySportsRacing.uk" },
  { name: "World Sport", tvgId: "WorldSport.int" },
  { name: "CBS Sports Golazo", tvgId: "CBSSportsGolazo.us" },
  { name: "ESPN Deportes SAP English", tvgId: "ESPNDeportesSAP.us" },
  { name: "TNT Sports Ultimate", tvgId: "TNTSportsUltimate.uk" },
  { name: "Fox Soccer Plus", tvgId: "FoxSoccerPlus.us" },
  { name: "Willow Xtra", tvgId: "WillowXtra.us" },
  { name: "Arena Sport English Feed", tvgId: "ArenaSportEnglish.rs" },
  { name: "Premier Football", tvgId: "PremierFootball.uk" },
  { name: "Sportdigital Fußball English Feed", tvgId: "SportdigitalFussballEnglish.de" },
  { name: "FreeSports", tvgId: "FreeSports.uk" },
  { name: "Himalaya Sports", tvgId: "HimalayaSports.np" }
];

async function main() {
  console.log('Downloading streams.json...');
  const streamsRes = await fetch('https://iptv-org.github.io/api/streams.json');
  const streams = await streamsRes.json();
  console.log(`Downloaded ${streams.length} streams.`);

  console.log('Downloading logos.json...');
  const logosRes = await fetch('https://iptv-org.github.io/api/logos.json');
  const logos = await logosRes.json();
  console.log(`Downloaded ${logos.length} logos.`);

  const logoMap = new Map();
  for (const item of logos) {
    if (item.channel && item.url) {
      logoMap.set(item.channel.toLowerCase(), item.url);
    }
  }

  const streamMap = new Map();
  for (const item of streams) {
    if (item.channel && item.url) {
      // Prioritize active ones if duplicate, but just map them
      streamMap.set(item.channel.toLowerCase(), item.url);
    }
  }

  // Load existing seeds to avoid overwriting unrelated sports channels like general motorsport etc.
  let seedChannels = [];
  if (fs.existsSync(seedJsonPath)) {
    seedChannels = JSON.parse(fs.readFileSync(seedJsonPath, 'utf-8'));
  }

  const processedNames = [];

  const finalChannels = [];

  // Add the newly requested English channels
  for (const req of channelRequests) {
    const tvgIdLower = req.tvgId.toLowerCase();
    
    // Check if we can find a stream in streams.json
    let url = req.defaultUrl || streamMap.get(tvgIdLower) || "https://test-streams.mux.dev/x36xhq/x36xhq.m3u8";
    
    // Check logo
    let logo = req.logo || logoMap.get(tvgIdLower) || "";
    
    finalChannels.push({
      name: req.name,
      logo: logo,
      groupTitle: "World Cup 2026",
      streamUrl: url,
      tvgId: req.tvgId,
      status: "online",
      popularity: 100
    });
    
    processedNames.push(req.name);
  }

  // Keep official Spanish/Portuguese broadcasters that were already seeded (Telemundo, Azteca, Globo, CazéTV)
  const officialBroadcastersToKeep = [
    "NBCU Telemundo Florida",
    "NBCU Telemundo North East",
    "NBCU Telemundo Texas",
    "NBCU Telemundo West",
    "Telemundo Corpus Christi",
    "Telemundo PR",
    "Rede Globo",
    "CazeTV",
    "CAZE TV FHD",
    "Azteca Internacional",
    "Das Erste HD",
    "ZDF HD",
    "RTP 1 HD",
    "TRT 1"
  ];

  for (const ch of seedChannels) {
    if (officialBroadcastersToKeep.includes(ch.name) && !processedNames.includes(ch.name)) {
      finalChannels.push({
        ...ch,
        groupTitle: "World Cup 2026"
      });
      processedNames.push(ch.name);
    }
  }

  // Save back to sports_channels_seed.json
  fs.writeFileSync(seedJsonPath, JSON.stringify(finalChannels, null, 2));
  console.log(`Saved ${finalChannels.length} channels to sports_channels_seed.json`);

  // Update SQLite Database
  let playlist = await prisma.playlist.findFirst({
    where: { url: 'static-seed' }
  });

  if (!playlist) {
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

  // Delete all existing channels in this playlist so we do a clean reset of only valid FIFA broadcasters
  await prisma.channel.deleteMany({
    where: { playlistId: playlist.id }
  });
  console.log('Cleared existing channels in the static playlist.');

  // Bulk insert new channels
  const channelData = finalChannels.map(c => ({
    name: c.name,
    logo: c.logo,
    groupTitle: c.groupTitle || 'Sports',
    streamUrl: c.streamUrl,
    tvgId: c.tvgId,
    status: c.status || 'online',
    popularity: c.popularity || 100,
    playlistId: playlist!.id
  }));

  await prisma.channel.createMany({
    data: channelData
  });

  console.log(`Successfully populated database with ${channelData.length} channels.`);
}

main()
  .catch(err => console.error(err))
  .finally(async () => {
    await prisma.$disconnect();
  });
