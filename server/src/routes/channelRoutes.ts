import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { parseM3UFromUrl } from '../services/iptvParser.js';
import { validateAllChannels, purgeDeadChannels, validateChannel } from '../services/channelValidator.js';
import { getSportsChannels } from '../services/iptvApiService.js';
import { syncAllEpg, syncEpgForChannel } from '../services/epgService.js';

const router = Router();
const prisma = new PrismaClient();

// Stream CORS proxy to fetch and rewrite HLS streams
router.get('/stream-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  const targetUrl = String(url);
  try {
    const response = await axios.get(targetUrl, {
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      },
      timeout: 12000
    });

    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    const isPlaylist = 
      contentType.includes('mpegurl') || 
      contentType.includes('apple.mpegurl') || 
      contentType.includes('x-mpegurl') || 
      targetUrl.includes('.m3u8');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (isPlaylist) {
      let dataStr = '';
      response.data.on('data', (chunk: any) => {
        dataStr += chunk.toString();
      });

      response.data.on('end', () => {
        const lines = dataStr.split('\n');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const backendUrl = `${protocol}://${req.get('host')}`;
        
        const rewrittenLines = lines.map(line => {
          const trimmed = line.trim();
          if (!trimmed) return line;

          if (trimmed.startsWith('#')) {
            // It's a tag, search for URI="xxx" and rewrite it
            return line.replace(/URI=["']([^"']+)["']/g, (match, p1) => {
              let absoluteUrl = p1;
              if (!p1.startsWith('http://') && !p1.startsWith('https://')) {
                try {
                  absoluteUrl = new URL(p1, targetUrl).toString();
                } catch (e) {
                  return match;
                }
              }
              return `URI="${backendUrl}/api/channels/stream-proxy?url=${encodeURIComponent(absoluteUrl)}"`;
            });
          } else {
            // It's a stream segment or sub-playlist URL
            let absoluteUrl = trimmed;
            if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
              try {
                absoluteUrl = new URL(trimmed, targetUrl).toString();
              } catch (e) {
                return line;
              }
            }
            return `${backendUrl}/api/channels/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
          }
        });

        res.setHeader('Content-Type', String(response.headers['content-type'] || 'application/vnd.apple.mpegurl'));
        res.send(rewrittenLines.join('\n'));
      });

      response.data.on('error', (err: any) => {
        if (!res.headersSent) {
          res.status(502).json({ error: 'Failed to read playlist stream', details: err.message });
        }
      });
    } else {
      res.setHeader('Content-Type', String(response.headers['content-type'] || 'video/MP2T'));
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', String(response.headers['content-length']));
      }
      response.data.pipe(res);

      response.data.on('error', (err: any) => {
        console.error('Error during media chunk pipe:', err.message);
      });
    }
  } catch (error: any) {
    console.error(`Stream proxy failed for URL: ${targetUrl}`, error.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Failed to proxy stream', details: error.message });
    }
  }
});

// Get local sports channels
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    const where: any = {};

    if (q) {
      where.name = { contains: String(q) };
    }

    const now = new Date();
    const channels = await prisma.channel.findMany({
      where,
      take: 500, 
      orderBy: { name: 'asc' },
      include: {
        programs: {
          where: {
            startTime: { lte: now },
            endTime: { gte: now }
          },
          take: 1
        }
      }
    });

    res.json(channels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// Search global sports channels
router.get('/iptv-org/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    const channels = await getSportsChannels(limit ? Number(limit) : 200, q ? String(q) : undefined);
    res.json(channels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to search global sports' });
  }
});

// Validate a specific channel
router.post('/validate/:id', async (req, res) => {
  const { id } = req.params;
  const channel = await prisma.channel.findUnique({ where: { id } });
  
  if (!channel) {
    return res.status(404).json({ error: 'Channel not found' });
  }

  // Run validation
  const isOnline = await validateChannel(channel.id, channel.streamUrl);
  res.json({ id: channel.id, status: isOnline ? 'online' : 'offline' });
});

// Trigger global channel validation
router.post('/validate', async (req, res) => {
  const { forceAll } = req.body;
  validateAllChannels(!!forceAll); // Run in background
  res.json({ message: 'Deep channel validation started in background' });
});

// Manual purge of dead channels
router.post('/purge', async (req, res) => {
  const count = await purgeDeadChannels();
  res.json({ message: `Successfully purged ${count} dead channels` });
});

// Import channels from URL or IPTV-org API
router.post('/import', async (req, res) => {
  const { url, name, useApi, query, limit } = req.body;
  
  try {
    // 1. Create a default user if not exists (for testing)
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@webtv.local',
          passwordHash: 'placeholder',
          role: 'admin'
        }
      });
    }

    // 2. Create playlist
    const playlist = await prisma.playlist.create({
      data: {
        name: name || (useApi ? 'IPTV-org Search Import' : 'Imported Playlist'),
        url: url || 'api-search',
        userId: user.id
      }
    });

    // 3. Parse and Save channels
    let channels = [];
    if (useApi) {
      channels = await getSportsChannels(limit || 500, query);
    } else {
      channels = await parseM3UFromUrl(url);
    }
    
    // Bulk create channels
    const channelData = channels.map(c => ({
      ...c,
      playlistId: playlist.id
    }));

    await prisma.channel.createMany({
      data: channelData
    });

    res.json({ message: `Imported ${channels.length} channels`, playlistId: playlist.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Import failed' });
  }
});

// Fetch live matches and schedules directly from ntvs.cx
router.get('/live-matches', async (req, res) => {
  try {
    const response = await axios.get('https://www.ntvs.cx/api/get-matches?server=kobra&type=both', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.ntvs.cx/'
      },
      timeout: 20000
    });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch match list from server', details: error.message });
  }
});

// Proxy route to pull live sports events from cdn-live-tv
router.get('/live-events', async (req, res) => {
  try {
    const response = await axios.get('https://api.cdnlivetv.tv/api/v1/events/sports/?user=cdnlivetv&plan=free', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 15000
    });

    const data = response.data;
    let filteredSoccer: any[] = [];

    if (data && data['cdn-live-tv'] && data['cdn-live-tv']['Soccer']) {
      const soccerEvents = data['cdn-live-tv']['Soccer'];
      if (Array.isArray(soccerEvents)) {
        filteredSoccer = soccerEvents.filter((e: any) => {
          const tournament = String(e.tournament || '').toLowerCase();
          const homeTeam = String(e.homeTeam || '').trim();
          const awayTeam = String(e.awayTeam || '').trim();
          return (
            (tournament.includes('world cup') || tournament.includes('fifa')) &&
            homeTeam !== '' &&
            awayTeam !== ''
          );
        });
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({
      'cdn-live-tv': {
        'Soccer': filteredSoccer
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch sports events from api', details: error.message });
  }
});

// Ad-blocking proxy for player iframe pages
router.get('/player-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  try {
    const response = await axios.get(String(url), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      },
      timeout: 10000
    });

    let html = response.data;

    // 1. Remove popup/redirect ad network scripts
    html = html.replace(/<script[^>]*src="\/\/fw\.hubeamily\.com[^>]*><\/script>/gi, '');
    html = html.replace(/<script[^>]*src="\/\/zq\.trovesleepit\.com[^>]*><\/script>/gi, '');
    html = html.replace(/<script[^>]*s10\.histats\.com[^>]*>[\s\S]*?<\/script>/gi, '');

    // 2. Remove sandboxed iframe detection checks to prevent block pages
    html = html.replace(/\(function\(\)\{\s*if\(window\.top===window\.self\)return;[\s\S]*?\}\)\(\);/gi, '');

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(html);
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to proxy player', details: error.message });
  }
});

// Extract player iframe embed URL from a live match watch page (e.g. ntvs.cx)
router.get('/extract-embed', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({ error: 'Missing url parameter' });
    return;
  }

  const targetUrl = String(url);
  try {
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html'
      },
      timeout: 10000
    });

    const html = response.data;
    // Extract stream player iframe src
    const iframeMatch = html.match(/<iframe[^>]*id="streamPlayer"[^>]*src="([^"]+)"/i) || 
                        html.match(/src="(\/embed\?t=[^"]+)"/i);
    
    if (iframeMatch) {
      let embedUrl = iframeMatch[1];
      if (embedUrl.startsWith('/')) {
        const parsedUrl = new URL(targetUrl);
        embedUrl = `${parsedUrl.protocol}//${parsedUrl.host}${embedUrl}`;
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.json({ success: true, embedUrl });
    } else {
      res.status(404).json({ success: false, error: 'Stream player iframe not found in the page.' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch match page', details: error.message });
  }
});

export default router;
