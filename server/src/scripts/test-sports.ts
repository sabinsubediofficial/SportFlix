import fs from 'fs';
import parser from 'iptv-playlist-parser';

async function main() {
  console.log('Downloading Sports playlist...');
  const res = await fetch('https://iptv-org.github.io/iptv/categories/sports.m3u');
  if (!res.ok) {
    throw new Error('Failed to download Sports playlist');
  }
  const playlistText = await res.text();
  console.log('Parsing playlist...');
  const result = parser.parse(playlistText);
  console.log(`Parsed ${result.items.length} channels.`);

  const targets = [
    'fox', 'fs1', 'bbc one', 'bbc two', 'itv1', 'tsn', 'ctv', 'sbs', 
    'sbs viceland', 'rte 2', 'rté 2', 'virgin media one', 'supersport', 
    'sky sport', 'now sports'
  ];

  const matches = [];
  for (const item of result.items) {
    const name = item.name.toLowerCase();
    const matched = targets.find(t => {
      const regex = new RegExp('\\b' + t + '\\b', 'i');
      return regex.test(name);
    });
    if (matched) {
      matches.push({
        name: item.name,
        url: item.url,
        matched,
        logo: item.tvg.logo
      });
    }
  }

  console.log(`Found ${matches.length} matching channels:`);
  console.log(JSON.stringify(matches.slice(0, 50), null, 2));
  if (matches.length > 50) {
    console.log(`... and ${matches.length - 50} more`);
  }
}

main().catch(err => console.error(err));
