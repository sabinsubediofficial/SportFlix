import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayer } from '../context/PlayerContext';
import { Trophy, Calendar, Play, Tv } from 'lucide-react';

interface RemoteChannel {
  id: string;
  channel_name: string;
  channel_code: string;
  viewers: number;
  url: string;
  image: string;
}

interface RemoteEvent {
  gameID: string;
  event: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamIMG: string;
  awayTeamIMG: string;
  time: string;
  tournament: string;
  country: string;
  countryIMG: string;
  status: string;
  start: string; // "YYYY-MM-DD HH:mm" (UTC)
  end: string;
  channels: RemoteChannel[];
}

const flagMapping: Record<string, string> = {
  'côte d’ivoire': 'ci',
  'cote d\'ivoire': 'ci',
  'norway': 'no',
  'france': 'fr',
  'sweden': 'se',
  'mexico': 'mx',
  'ecuador': 'ec',
  'england': 'gb-eng',
  'dr congo': 'cd',
  'congo': 'cd',
  'belgium': 'be',
  'senegal': 'sn',
  'usa': 'us',
  'united states': 'us',
  'bosnia and herzegovina': 'ba',
  'bosnia': 'ba',
  'spain': 'es',
  'austria': 'at',
  'portugal': 'pt',
  'croatia': 'hr',
  'switzerland': 'ch',
  'algeria': 'dz',
  'australia': 'au',
  'egypt': 'eg',
  'argentina': 'ar',
  'cape verde': 'cv',
  'colombia': 'co',
  'ghana': 'gh',
  'morocco': 'ma',
  'canada': 'ca'
};

const getCountryFlagUrl = (teamName: string) => {
  if (!teamName) return 'https://flagcdn.com/w80/un.png';
  const lower = teamName.toLowerCase().trim();
  for (const [key, code] of Object.entries(flagMapping)) {
    if (lower.includes(key) || key.includes(lower)) {
      return `https://flagcdn.com/w80/${code}.png`;
    }
  }
  return 'https://flagcdn.com/w80/un.png';
};

const getLocalDateString = (utcDateTimeStr: string) => {
  const dateObj = new Date(utcDateTimeStr);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getLocalTimeString = (utcDateTimeStr: string) => {
  const dateObj = new Date(utcDateTimeStr);
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const WorldCup = () => {
  const { openPlayer } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Pull live events list from our CDN live API proxy
  const { data, isLoading, error } = useQuery({
    queryKey: ['cdnLiveEvents'],
    queryFn: async () => {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/channels/live-events`);
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      return res.json();
    },
    refetchInterval: 15000, // refresh every 15 seconds for real-time states
  });

  const parsedMatches = useMemo(() => {
    if (!data || !data['cdn-live-tv'] || !data['cdn-live-tv']['Soccer']) return [];
    
    const soccerEvents: RemoteEvent[] = data['cdn-live-tv']['Soccer'];
    
    // Filter for FIFA World Cup matches only (with valid team names)
    const worldCupEvents = soccerEvents.filter(e => 
      (e.tournament.toLowerCase().includes('world cup') || e.tournament.toLowerCase().includes('fifa')) &&
      e.homeTeam.trim() !== '' &&
      e.awayTeam.trim() !== ''
    );

    return worldCupEvents.map(e => {
      // Start time in the API is in UTC format "YYYY-MM-DD HH:mm"
      const parsedUtcTime = e.start.replace(' ', 'T') + 'Z';
      const homeName = e.homeTeam.trim() || 'TBD';
      const awayName = e.awayTeam.trim() || 'TBD';
      
      const liveStatus = ['LIVE', '1H', '2H', 'HT'].includes(e.status.toUpperCase());

      return {
        id: e.gameID,
        title: homeName !== 'TBD' ? `${homeName} vs ${awayName}` : e.tournament,
        utcDateTime: parsedUtcTime,
        homeTeam: homeName,
        awayTeam: awayName,
        homeFlag: getCountryFlagUrl(homeName),
        awayFlag: getCountryFlagUrl(awayName),
        live: liveStatus,
        statusLabel: e.status,
        channels: e.channels || []
      };
    });
  }, [data]);

  // Sort matches chronologically
  const sortedMatches = useMemo(() => {
    return [...parsedMatches].sort((a, b) => new Date(a.utcDateTime).getTime() - new Date(b.utcDateTime).getTime());
  }, [parsedMatches]);

  const dateTabs = useMemo(() => {
    const dates = sortedMatches.map(m => getLocalDateString(m.utcDateTime));
    return Array.from(new Set(dates));
  }, [sortedMatches]);

  // Auto-select active date tab
  useEffect(() => {
    if (dateTabs.length > 0 && !selectedDate) {
      const todayStr = getLocalDateString(new Date().toISOString());
      if (dateTabs.includes(todayStr)) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(dateTabs[0]);
      }
    }
  }, [dateTabs, selectedDate]);

  const filteredMatches = useMemo(() => {
    return sortedMatches.filter(match => getLocalDateString(match.utcDateTime) === selectedDate);
  }, [sortedMatches, selectedDate]);

  const handleWatchMatch = (matchTitle: string, channels: RemoteChannel[]) => {
    // Select the best stream channel (English feeds like US, UK, Fox, ITV first)
    let bestChannel = channels.find(c => 
      c.channel_name.toUpperCase().includes('US') ||
      c.channel_name.toUpperCase().includes('UK') ||
      c.channel_name.toUpperCase().includes('ENG') ||
      c.channel_name.toUpperCase().includes('FOX') ||
      c.channel_name.toUpperCase().includes('ITV')
    );

    if (!bestChannel && channels.length > 0) {
      bestChannel = channels[0];
    }

    const streamUrl = bestChannel 
      ? bestChannel.url 
      : 'https://cdnlivetv.tv/secure/api/v1/6a288d2a81d8192bb76cc386/playlist.m3u8?token=NmEyODhkMmE4MWQ4MTkyYmI3NmNjMzg2OjE3ODI4OTE0NDAxMDQ6Y2RubGl2ZXR2LnR2OjUxMWNiZDJiZTUyNDI4Y2UuMTA0YzU5OWE5YTIyMGNjNjFjNjg3ZGM3NDc1NzFlYjM3M2M5NmUwMDUwNzNhMzBhYzAyYTYwZmY0YjIzMTAyNw';

    const targetChannel = {
      id: bestChannel ? bestChannel.id : 'fallback-fifa',
      name: matchTitle,
      streamUrl: streamUrl,
      groupTitle: 'Live Streams'
    };
    
    openPlayer(targetChannel);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#050505]">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-t-2 border-blue-500 rounded-full animate-spin" />
        <div className="mt-8 text-center text-white/40 font-black tracking-widest uppercase text-xs">Loading FIFA Streams</div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#050505] p-6 text-center">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-4">
        <Trophy className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">API Connection Failed</h3>
      <p className="text-white/60 max-w-md mb-6 text-sm">
        Could not load live schedules. Your Vercel environment variable <code>VITE_API_URL</code> might be missing or your backend server is offline.
      </p>
      <div className="bg-white/5 border border-white/5 p-4 rounded-xl text-left max-w-md w-full font-mono text-[10px] text-white/40 break-all">
        Attempted endpoint: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/channels/live-events
        <br />
        Error: {(error as any).message}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      {/* World Cup Hero Banner */}
      <div className="relative h-[320px] w-full overflow-hidden flex items-end p-6 md:p-12 lg:p-16">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=2000')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
        </div>
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
          <div className="flex items-center space-x-3 mb-4 animate-in fade-in duration-500">
            <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Trophy className="w-5 h-5 text-blue-500 animate-pulse" />
            </div>
            <span className="text-blue-500 text-xs font-black uppercase tracking-[0.25em] drop-shadow">FIFA Campaign</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl leading-none">
            World Cup <span className="bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">2026</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl font-medium mt-4 leading-relaxed drop-shadow-sm">
            Experience the drama, passion, and excitement of football's greatest tournament. Watch every match live, track schedules, and access premium international streams directly in one clean hub.
          </p>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto mt-8">
        {/* Match Schedule Section */}
        <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Calendar className="text-blue-500" /> Match Schedules
              </h2>
              <p className="text-white/40 text-sm mt-1">Official Round of 32 tournament schedules</p>
            </div>

            {/* Date Tabs */}
            {dateTabs.length > 0 && (
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit overflow-x-auto max-w-full scrollbar-hide">
                {dateTabs.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      selectedDate === date 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredMatches.length === 0 ? (
            <div className="flex items-center gap-3 p-8 bg-white/5 border border-white/5 rounded-2xl text-white/40">
              <Tv className="w-6 h-6 text-blue-500" />
              <p className="font-bold text-sm">No matches are scheduled for this day.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMatches.map((match) => (
                <div 
                  key={match.id} 
                  className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 group shadow-lg relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-wider mb-4">
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${match.live ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                        FIFA World Cup
                      </span>
                      <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-white/60 border border-white/5">
                        {match.live ? `${match.statusLabel} Live` : getLocalTimeString(match.utcDateTime)}
                      </span>
                    </div>

                    {/* Teams Display */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="flex items-center space-x-3 flex-1 justify-end">
                        <span className="text-xs font-bold text-white truncate max-w-[80px] text-right">
                          {match.homeTeam}
                        </span>
                        {match.homeFlag && (
                          <img 
                            src={match.homeFlag} 
                            alt={match.homeTeam} 
                            className="w-8 h-8 object-contain shrink-0 filter drop-shadow-md rounded"
                          />
                        )}
                      </div>
                      
                      <span className="text-white/20 font-black text-[10px] italic uppercase tracking-wider shrink-0">VS</span>
                      
                      <div className="flex items-center space-x-3 flex-1 justify-start">
                        {match.awayFlag && (
                          <img 
                            src={match.awayFlag} 
                            alt={match.awayTeam} 
                            className="w-8 h-8 object-contain shrink-0 filter drop-shadow-md rounded"
                          />
                        )}
                        <span className="text-xs font-bold text-white truncate max-w-[80px] text-left">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button Conditional on Live State */}
                  <div className="border-t border-white/5 pt-4 mt-2">
                    {match.live ? (
                      <button
                        onClick={() => handleWatchMatch(match.title, match.channels)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white shadow-lg shadow-emerald-500/5"
                      >
                        <Play size={12} className="fill-current" />
                        <span>WATCH LIVE NOW</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black border border-white/5 bg-white/5 text-white/30 select-none">
                        <span>UPCOMING MATCH</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WorldCup;
