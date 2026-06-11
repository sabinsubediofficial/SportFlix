import fs from 'fs';

const csvPath = "C:\\Users\\sabin\\.gemini\\antigravity\\brain\\fed69d20-1c0b-4585-a1ff-0731dd1c8a5b\\.system_generated\\steps\\1917\\content.md";

try {
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = fileContent.split('\n');
  
  let headerIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("id,name,")) {
      headerIdx = i;
      break;
    }
  }

  if (headerIdx === -1) headerIdx = 8;

  const results = [];
  const patterns = [/\bctv\b/i, /\btsn\b/i, /\brds\b/i];

  for (let i = headerIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = line.split(',');
    if (values.length < 2) continue;
    
    const id = values[0];
    const name = values[1];
    const country = values[5];
    
    if (name && patterns.some(p => p.test(name)) && country === 'CA') {
      results.push({
        id,
        name,
        country,
        website: values[values.length - 1]
      });
    }
  }

  console.log(`=== Canadian Channels in channels.csv (${results.length} found) ===`);
  results.forEach(r => {
    console.log(`- ${r.name} (ID: ${r.id}) | Website: ${r.website}`);
  });

} catch (error) {
  console.error(error.message);
}
