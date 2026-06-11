import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
const prisma = new PrismaClient();
async function exportChannels() {
    console.log('Fetching channels from database...');
    const channels = await prisma.channel.findMany({
        select: {
            name: true,
            streamUrl: true,
            groupTitle: true,
            status: true
        }
    });
    console.log(`Found ${channels.length} channels. Formatting list...`);
    const content = channels.map((c, i) => {
        return `${i + 1}. [${c.status.toUpperCase()}] ${c.name}\n   Category: ${c.groupTitle || 'General'}\n   Stream URL: ${c.streamUrl}\n   -------------------------------------------`;
    }).join('\n\n');
    const outputPath = path.join(process.cwd(), '..', 'all_channels.txt');
    fs.writeFileSync(outputPath, content);
    console.log(`Successfully exported all channels to: ${path.resolve(outputPath)}`);
    process.exit(0);
}
exportChannels().catch(err => {
    console.error('Export failed:', err);
    process.exit(1);
});
//# sourceMappingURL=export_channels.js.map