import axios from 'axios';

const API_BASE_URL = 'https://iptv-org.github.io/api';

export interface IptvChannel {
  id: string;
  name: string;
  logo: string | null;
  categories: string[];
}

// Simple in-memory cache
let cachedChannels: any[] | null = null;
let cachedStreams: any[] | null = null;
let cachedLogos: any[] | null = null;
let cachedGuides: any[] | null = null;
let cachedMergedSportsChannels: any[] | null = null;
let lastFetch: number = 0;
let lastGuidesFetch: number = 0;
let lastSportsMerge: number = 0;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export const fetchIptvApiChannels = async () => {
  if (cachedChannels && (Date.now() - lastFetch < CACHE_DURATION)) {
    return cachedChannels;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/channels.json`);
    cachedChannels = response.data;
    lastFetch = Date.now();
    return cachedChannels;
  } catch (error) {
    console.error('Error fetching IPTV channels:', error);
    throw error;
  }
};

export const fetchIptvApiStreams = async () => {
  if (cachedStreams && (Date.now() - lastFetch < CACHE_DURATION)) {
    return cachedStreams;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/streams.json`);
    cachedStreams = response.data;
    return cachedStreams;
  } catch (error) {
    console.error('Error fetching IPTV streams:', error);
    throw error;
  }
};

export const fetchIptvApiLogos = async () => {
  if (cachedLogos && (Date.now() - lastFetch < CACHE_DURATION)) {
    return cachedLogos;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/logos.json`);
    cachedLogos = response.data;
    return cachedLogos;
  } catch (error) {
    console.error('Error fetching IPTV logos:', error);
    throw error;
  }
};

export const fetchIptvApiGuides = async () => {
  if (cachedGuides && (Date.now() - lastGuidesFetch < CACHE_DURATION)) {
    return cachedGuides;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/guides.json`);
    cachedGuides = response.data;
    lastGuidesFetch = Date.now();
    return cachedGuides;
  } catch (error) {
    console.error('Error fetching IPTV guides:', error);
    throw error;
  }
};

export const getPopularityScore = (name: string): number => {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let score = 0;

  // Rank 1: Tier-1 Giants (ESPN, Sky Sports, BeIN Sports)
  const tier1 = ['espn', 'sky', 'bein'];
  
  // Rank 2: Premium Global Networks (Fox Sports, TNT/BT Sport, Eurosport, DAZN, NBC Sports, CBS Sports)
  const tier2 = ['foxsport', 'fs1', 'fs2', 'btsport', 'tntsport', 'eurosport', 'dazn', 'nbcsport', 'cbssport'];
  
  // Rank 3: Premium Regional Networks (Canal+, SuperSport, Star Sports, TSN, Sportsnet, Sony Ten, Astro)
  const tier3 = ['canal', 'supersport', 'starsport', 'tsn', 'sportsnet', 'sonyten', 'astro'];
  
  // Rank 4: Niche/Dedicated Networks (Optus Sport, Movistar, Eleven Sport, Ziggo Sport, CCTV, RMC Sport, F1, NFL, NBA, MLB)
  const tier4 = ['optussport', 'movistar', 'elevensport', 'ziggosport', 'cctv5', 'rmcsport', 'f1', 'nfl', 'nba', 'mlb', 'premierleague', 'fifa'];
  
  // Rank 5: General Sports Keyword matching
  const generalSports = ['sport', 'football', 'soccer', 'tennis', 'golf', 'racing', 'cricket', 'rugby', 'fight'];

  if (tier1.some(kw => normalized.includes(kw))) {
    score += 1000;
  } else if (tier2.some(kw => normalized.includes(kw))) {
    score += 750;
  } else if (tier3.some(kw => normalized.includes(kw))) {
    score += 500;
  } else if (tier4.some(kw => normalized.includes(kw))) {
    score += 250;
  } else if (generalSports.some(kw => normalized.includes(kw))) {
    score += 100;
  }

  // Bonus for HD/4K/Premium
  if (normalized.includes('hd') || normalized.includes('4k') || normalized.includes('premium')) {
    score += 25;
  }

  return score;
};

export const getSportsChannels = async (limit: number = 500, query?: string) => {
  // If we have cached merged sports channels and the cache is fresh, use it
  if (!cachedMergedSportsChannels || (Date.now() - lastSportsMerge > CACHE_DURATION)) {
    console.log('Fetching and merging Sports channels from IPTV-org API...');
    const [channels, streams, logos] = await Promise.all([
      fetchIptvApiChannels(),
      fetchIptvApiStreams(),
      fetchIptvApiLogos()
    ]);

    // Map streams by channel id
    const streamMap = new Map();
    streams?.forEach((stream: any) => {
      if (!streamMap.has(stream.channel)) {
        streamMap.set(stream.channel, stream);
      }
    });

    // Map logos by channel id
    const logoMap = new Map();
    logos?.forEach((logo: any) => {
      if (!logoMap.has(logo.channel)) {
        logoMap.set(logo.channel, logo.url);
      }
    });

    const sportsKeywords = ['sport', 'football', 'soccer', 'tennis', 'espn', 'bein', 'racing', 'moto', 'f1', 'fifa', 'nba', 'nfl', 'cricket'];

    const filteredChannels = channels?.filter((channel: any) => {
      // Check official categories
      const isSportsCat = channel.categories && channel.categories.some((cat: string) => cat.toLowerCase() === 'sports');
      
      // Check keywords in name or id
      const nameMatch = sportsKeywords.some(kw => channel.name.toLowerCase().includes(kw) || channel.id.toLowerCase().includes(kw));
      
      // Only keep if it has a stream
      return (isSportsCat || nameMatch) && streamMap.has(channel.id);
    }) || [];

    const merged = [];
    const seenUrls = new Set();

    for (const channel of filteredChannels) {
      const stream = streamMap.get(channel.id);
      const logoUrl = logoMap.get(channel.id) || null;

      if (stream && !seenUrls.has(stream.url)) {
        seenUrls.add(stream.url);
        merged.push({
          name: channel.name,
          logo: logoUrl,
          groupTitle: 'Sports',
          streamUrl: stream.url,
          tvgId: channel.id,
          status: 'unknown',
          popularity: getPopularityScore(channel.name)
        });
      }
    }

    cachedMergedSportsChannels = merged;
    lastSportsMerge = Date.now();
  }

  // Filter and limit
  let result = cachedMergedSportsChannels;
  if (query) {
    const lowerQuery = query.toLowerCase();
    result = result.filter((c: any) => c.name.toLowerCase().includes(lowerQuery));
  }

  return result.slice(0, limit);
};
