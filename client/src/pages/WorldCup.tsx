import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { usePlayer } from '../context/PlayerContext';
import { Trophy, Calendar, Play, Tv } from 'lucide-react';

interface RemoteMatch {
  id: string;
  title: string;
  category: string;
  date: number; // timestamp in ms
  popular?: boolean;
  teams: {
    home: { name: string; badge: string };
    away: { name: string; badge: string };
  };
  sources: { source: string; id: string }[];
  live: boolean;
}

const getLocalDateString = (timestampMs: number) => {
  const dateObj = new Date(timestampMs);
  return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const getLocalTimeString = (timestampMs: number) => {
  const dateObj = new Date(timestampMs);
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getTabLabel = (dateStr: string) => {
  const dateObj = new Date(dateStr + ', ' + new Date().getFullYear());
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  return `${dayName} - ${dateStr}`;
};

const getBadgeUrl = (badgeHash: string) => {
  if (!badgeHash) return '';
  if (badgeHash.startsWith('http')) return badgeHash;
  if (badgeHash.startsWith('/api')) return `https://www.ntvs.cx${badgeHash}`;
  return `https://www.ntvs.cx/api/images/proxy/${badgeHash}.webp`;
};

const WorldCup = () => {
  const { openPlayer } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Return empty string initial state
    return '';
  });

  // Fetch live matches directly from our proxy endpoint
  const { data, isLoading, error } = useQuery({
    queryKey: ['liveMatches'],
    queryFn: async (): Promise<{ success: boolean; all: RemoteMatch[]; live: RemoteMatch[] }> => {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/channels/live-matches`);
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      return res.json();
    },
    refetchInterval: 15000, // refresh every 15 seconds (real-time updates)
  });

  const allMatches = useMemo(() => {
    if (!data || !data.all) return [];
    return data.all;
  }, [data]);

  const dateTabs = useMemo(() => {
    const dates = allMatches.map(m => getLocalDateString(m.date));
    return Array.from(new Set(dates)).sort((a, b) => {
      const year = new Date().getFullYear();
      return new Date(`${a}, ${year}`).getTime() - new Date(`${b}, ${year}`).getTime();
    });
  }, [allMatches]);

  // Auto-select first date tab when loaded
  useEffect(() => {
    if (dateTabs.length > 0 && !selectedDate) {
      setSelectedDate(dateTabs[0]);
    }
  }, [dateTabs, selectedDate]);

  const filteredMatches = useMemo(() => {
    return allMatches.filter(match => getLocalDateString(match.date) === selectedDate);
  }, [allMatches, selectedDate]);

  const handleWatchMatch = (matchId: string, matchTitle: string) => {
    // Generate the player payload pointing to the integrated cdnlivetv working live stream link
    const targetChannel = {
      id: matchId,
      name: matchTitle,
      streamUrl: 'https://cdnlivetv.tv/secure/api/v1/6a288d2a81d8192bb76cc386/playlist.m3u8?token=NmEyODhkMmE4MWQ4MTkyYmI3NmNjMzg2OjE3ODI4OTE0NDAxMDQ6Y2RubGl2ZXR2LnR2OjUxMWNiZDJiZTUyNDI4Y2UuMTA0YzU5OWE5YTIyMGNjNjFjNjg3ZGM3NDc1NzFlYjM3M2M5NmUwMDUwNzNhMzBhYzAyYTYwZmY0YjIzMTAyNw',
      groupTitle: 'Live Streams'
    };
    openPlayer(targetChannel);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#050505]">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-t-2 border-blue-500 rounded-full animate-spin" />
        <div className="mt-8 text-center text-white/40 font-black tracking-widest uppercase text-xs">Loading Live Schedules</div>
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
        Attempted endpoint: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/channels/live-matches
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
              <p className="text-white/40 text-sm mt-1">Official matches for the opening days</p>
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
                    {getTabLabel(date)}
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
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {match.category}
                      </span>
                      <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-white/60 border border-white/5">
                        {getLocalTimeString(match.date)}
                      </span>
                    </div>

                    {/* Teams Display */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="flex items-center space-x-3 flex-1 justify-end">
                        <span className="text-xs font-bold text-white truncate max-w-[80px] text-right">
                          {match.teams.home.name}
                        </span>
                        {match.teams.home.badge && (
                          <img 
                            src={getBadgeUrl(match.teams.home.badge)} 
                            alt={match.teams.home.name} 
                            className="w-8 h-8 object-contain shrink-0 filter drop-shadow-md"
                          />
                        )}
                      </div>
                      
                      <span className="text-white/20 font-black text-[10px] italic uppercase tracking-wider shrink-0">VS</span>
                      
                      <div className="flex items-center space-x-3 flex-1 justify-start">
                        {match.teams.away.badge && (
                          <img 
                            src={getBadgeUrl(match.teams.away.badge)} 
                            alt={match.teams.away.name} 
                            className="w-8 h-8 object-contain shrink-0 filter drop-shadow-md"
                          />
                        )}
                        <span className="text-xs font-bold text-white truncate max-w-[80px] text-left">
                          {match.teams.away.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Play Button Conditional on Live State */}
                  <div className="border-t border-white/5 pt-4 mt-2">
                    {match.live ? (
                      <button
                        onClick={() => handleWatchMatch(match.id, match.title)}
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
