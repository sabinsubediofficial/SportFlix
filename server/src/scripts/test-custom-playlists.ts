import fs from 'fs';
import parser from 'iptv-playlist-parser';

const playlists = [
  'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
  'https://iptv-org.github.io/iptv/categories/sports.m3u',
  'https://raw.githubusercontent.com/clover-tv/clover/main/playlist.m3u',
  'https://raw.githubusercontent.com/billy3321/free-iptv/master/playlist.m3u',
  'https://raw.githubusercontent.com/LaneSh4d0w/IPTV/master/sports.m3u'
];

const targets = [
  'fox', 'fs1', 'bbc one', 'bbc two', 'itv1', 'tsn', 'ctv', 'sbs', 
  'sbs viceland', 'rte 2', 'rté 2', 'virgin media one', 'supersport', 
  'sky sport', 'now sports'
];

async function verifyUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (err) {
    return false;
  }
}

async function main() {
  const consolidated = new Map();

  for (const url of playlists) {
    console.log(`Downloading playlist from: ${url}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`Failed to download: ${url}`);
        continue;
      }
      const text = await res.text();
      const result = parser.parse(text);
      console.log(`Parsed ${result.items.length} channels.`);

      for (const item of result.items) {
        const nameLower = item.name.toLowerCase();
        const matched = targets.find(t => {
          const regex = new RegExp('\\b' + t + '\\b', 'i');
          return regex.test(nameLower);
        });

        if (matched) {
          // Exclude clearly wrong ones
          if (matched === 'ctv' && nameLower.includes('abc')) continue; // exclude ABCTV matching ctv
          if (matched === 'sbs' && !nameLower.includes('australia') && (nameLower.includes('korea') || nameLower.includes('sbs tv') || nameLower.includes('cjb') || nameLower.includes('jtv') || nameLower.includes('knn') || nameLower.includes('ubc') || nameLower.includes('tbc') || nameLower.includes('g1'))) {
            // exclude Korean SBS regional feeds
            continue;
          }

          const key = `${matched}:${item.url}`;
          if (!consolidated.has(key)) {
            consolidated.set(key, {
              target: matched,
              name: item.name,
              url: item.url,
              logo: item.tvg?.logo || ''
            });
          }
        }
      }
    } catch (error: any) {
      console.error(`Error processing ${url}: ${error.message}`);
    }
  }

  const items = Array.from(consolidated.values());
  console.log(`\nFound ${items.length} unique potential matches. Verifying live status...`);

  const verified = [];
  const batchSize = 10;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Verifying batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)}...`);
    const promises = batch.map(async (item) => {
      const isOnline = await verifyUrl(item.url);
      return { ...item, status: isOnline ? 'online' : 'offline' };
    });
    const results = await Promise.all(promises);
    verified.push(...results);
  }

  console.log('\n--- Match Verification Results ---');
  const grouped = {};
  for (const item of verified) {
    if (!grouped[item.target]) grouped[item.target] = [];
    grouped[item.target].push(item);
  }

  for (const target of targets) {
    const list = grouped[target] || [];
    console.log(`\n=== Target: ${target.toUpperCase()} (${list.length} unique matches) ===`);
    const online = list.filter(it => it.status === 'online');
    const offline = list.filter(it => it.status === 'offline');
    
    console.log(`  🟢 Online (${online.length}):`);
    online.forEach(it => {
      console.log(`    - Name: "${it.name}" | URL: ${it.url}`);
    });
    
    console.log(`  🔴 Offline (${offline.length}):`);
    offline.slice(0, 5).forEach(it => {
      console.log(`    - Name: "${it.name}" | URL: ${it.url}`);
    });
    if (offline.length > 5) {
      console.log(`    ... and ${offline.length - 5} more offline`);
    }
  }

  // Save the matches
  fs.writeFileSync(
    'C:\\Users\\sabin\\.gemini\\antigravity\\brain\\fed69d20-1c0b-4585-a1ff-0731dd1c8a5b\\scratch\\consolidated_wc_matches.json',
    JSON.stringify(verified, null, 2)
  );
  console.log(`\nResults written to C:\\Users\\sabin\\.gemini\\antigravity\\brain\\fed69d20-1c0b-4585-a1ff-0731dd1c8a5b\\scratch\\consolidated_wc_matches.json`);
}

main().catch(err => console.error(err));
