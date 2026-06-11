import fs from 'fs';
import path from 'path';
function main() {
    const filePath = path.join(process.cwd(), '..', 'all_channels.txt');
    const content = fs.readFileSync(filePath, 'utf-8');
    const blocks = content.split('-------------------------------------------');
    console.log("Searching for all BBC Two occurrences:");
    for (const block of blocks) {
        if (block.toLowerCase().includes('bbc two') && !block.toLowerCase().includes('geo-blocked')) {
            console.log(block.trim());
            console.log('---');
        }
    }
}
main();
//# sourceMappingURL=search_channels.js.map