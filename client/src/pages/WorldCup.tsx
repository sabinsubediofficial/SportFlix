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

interface Match {
  id: string;
  title: string;
  utcDateTime: string; // ISO format
  teams: {
    home: { name: string; flagUrl: string };
    away: { name: string; flagUrl: string };
  };
}

const matchesList: Match[] = [
  // Tuesday, June 30
  {
    id: 'm-ci-no',
    title: 'Côte d’Ivoire vs Norway',
    utcDateTime: '2026-06-30T17:00:00Z',
    teams: {
      home: { name: 'Côte d’Ivoire', flagUrl: 'https://flagcdn.com/w80/ci.png' },
      away: { name: 'Norway', flagUrl: 'https://flagcdn.com/w80/no.png' }
    }
  },
  {
    id: 'm-fr-se',
    title: 'France vs Sweden',
    utcDateTime: '2026-06-30T20:00:00Z',
    teams: {
      home: { name: 'France', flagUrl: 'https://flagcdn.com/w80/fr.png' },
      away: { name: 'Sweden', flagUrl: 'https://flagcdn.com/w80/se.png' }
    }
  },
  {
    id: 'm-mx-ec',
    title: 'Mexico vs Ecuador',
    utcDateTime: '2026-07-01T01:00:00Z',
    teams: {
      home: { name: 'Mexico', flagUrl: 'https://flagcdn.com/w80/mx.png' },
      away: { name: 'Ecuador', flagUrl: 'https://flagcdn.com/w80/ec.png' }
    }
  },
  // Wednesday, July 1
  {
    id: 'm-eng-cd',
    title: 'England vs DR Congo',
    utcDateTime: '2026-07-01T16:00:00Z',
    teams: {
      home: { name: 'England', flagUrl: 'https://flagcdn.com/w80/gb-eng.png' },
      away: { name: 'DR Congo', flagUrl: 'https://flagcdn.com/w80/cd.png' }
    }
  },
  {
    id: 'm-be-sn',
    title: 'Belgium vs Senegal',
    utcDateTime: '2026-07-01T20:00:00Z',
    teams: {
      home: { name: 'Belgium', flagUrl: 'https://flagcdn.com/w80/be.png' },
      away: { name: 'Senegal', flagUrl: 'https://flagcdn.com/w80/sn.png' }
    }
  },
  {
    id: 'm-us-ba',
    title: 'USA vs Bosnia and Herzegovina',
    utcDateTime: '2026-07-02T00:00:00Z',
    teams: {
      home: { name: 'USA', flagUrl: 'https://flagcdn.com/w80/us.png' },
      away: { name: 'Bosnia & Herzegovina', flagUrl: 'https://flagcdn.com/w80/ba.png' }
    }
  },
  // Thursday, July 2
  {
    id: 'm-es-at',
    title: 'Spain vs Austria',
    utcDateTime: '2026-07-02T19:00:00Z',
    teams: {
      home: { name: 'Spain', flagUrl: 'https://flagcdn.com/w80/es.png' },
      away: { name: 'Austria', flagUrl: 'https://flagcdn.com/w80/at.png' }
    }
  },
  {
    id: 'm-pt-hr',
    title: 'Portugal vs Croatia',
    utcDateTime: '2026-07-02T23:00:00Z',
    teams: {
      home: { name: 'Portugal', flagUrl: 'https://flagcdn.com/w80/pt.png' },
      away: { name: 'Croatia', flagUrl: 'https://flagcdn.com/w80/hr.png' }
    }
  },
  {
    id: 'm-ch-dz',
    title: 'Switzerland vs Algeria',
    utcDateTime: '2026-07-03T03:00:00Z',
    teams: {
      home: { name: 'Switzerland', flagUrl: 'https://flagcdn.com/w80/ch.png' },
      away: { name: 'Algeria', flagUrl: 'https://flagcdn.com/w80/dz.png' }
    }
  },
  // Friday, July 3
  {
    id: 'm-au-eg',
    title: 'Australia vs Egypt',
    utcDateTime: '2026-07-03T18:00:00Z',
    teams: {
      home: { name: 'Australia', flagUrl: 'https://flagcdn.com/w80/au.png' },
      away: { name: 'Egypt', flagUrl: 'https://flagcdn.com/w80/eg.png' }
    }
  },
  {
    id: 'm-ar-cv',
    title: 'Argentina vs Cape Verde',
    utcDateTime: '2026-07-03T22:00:00Z',
    teams: {
      home: { name: 'Argentina', flagUrl: 'https://flagcdn.com/w80/ar.png' },
      away: { name: 'Cape Verde', flagUrl: 'https://flagcdn.com/w80/cv.png' }
    }
  },
  {
    id: 'm-co-gh',
    title: 'Colombia vs Ghana',
    utcDateTime: '2026-07-04T01:30:00Z',
    teams: {
      home: { name: 'Colombia', flagUrl: 'https://flagcdn.com/w80/co.png' },
      away: { name: 'Ghana', flagUrl: 'https://flagcdn.com/w80/gh.png' }
    }
  }
];

const getLocalDateString = (utcDateTimeStr: string) => {
  const dateObj = new Date(utcDateTimeStr);
  return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const getLocalTimeString = (utcDateTimeStr: string) => {
  const dateObj = new Date(utcDateTimeStr);
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const isMatchEnded = (utcDateTimeStr: string) => {
  const matchTime = new Date(utcDateTimeStr).getTime();
  const durationMs = 3.5 * 60 * 60 * 1000; // 3.5 hours duration (allows matching late stages)
  return Date.now() > matchTime + durationMs;
};

const WorldCup = () => {
  const { openPlayer } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [now, setNow] = useState(Date.now());

  // Update clock every 10 seconds for match scheduling/live windowing
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real-time sports stream event logs
  const { data, isLoading } = useQuery({
    queryKey: ['cdnLiveEventsList'],
    queryFn: async () => {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/channels/live-events`);
      if (!res.ok) throw new Error(`Server returned status ${res.status}`);
      return res.json();
    },
    refetchInterval: 15000,
  });

  // Filter out any matches that have already ended in real-time
  const activeMatches = useMemo(() => {
    return matchesList.filter(m => !isMatchEnded(m.utcDateTime));
  }, [now]);

  const dateTabs = useMemo(() => {
    const dates = activeMatches.map(m => getLocalDateString(m.utcDateTime));
    const uniqueDates = Array.from(new Set(dates));
    return uniqueDates.sort((a, b) => {
      const matchA = activeMatches.find(m => getLocalDateString(m.utcDateTime) === a);
      const matchB = activeMatches.find(m => getLocalDateString(m.utcDateTime) === b);
      if (!matchA || !matchB) return 0;
      return new Date(matchA.utcDateTime).getTime() - new Date(matchB.utcDateTime).getTime();
    });
  }, [activeMatches]);

  useEffect(() => {
    if (dateTabs.length > 0 && (!selectedDate || !dateTabs.includes(selectedDate))) {
      const todayStr = getLocalDateString(new Date().toISOString());
      if (dateTabs.includes(todayStr)) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(dateTabs[0]);
      }
    }
  }, [dateTabs, selectedDate]);

  const filteredMatches = useMemo(() => {
    return activeMatches.filter(match => getLocalDateString(match.utcDateTime) === selectedDate);
  }, [activeMatches, selectedDate]);

  // Find a matching event in the live events API response
  const findMatchingLiveEvent = (matchTitle: string) => {
    if (!data || !data['cdn-live-tv'] || !data['cdn-live-tv']['Soccer']) return null;
    const soccerEvents: RemoteEvent[] = data['cdn-live-tv']['Soccer'];
    
    const parts = matchTitle.toLowerCase().split('vs');
    if (parts.length < 2) return null;
    const teamA = parts[0].trim();
    const teamB = parts[1].trim();

    return soccerEvents.find(e => 
      (e.homeTeam.toLowerCase().includes(teamA) || e.awayTeam.toLowerCase().includes(teamA) ||
       e.homeTeam.toLowerCase().includes(teamB) || e.awayTeam.toLowerCase().includes(teamB)) &&
      (e.tournament.toLowerCase().includes('world cup') || e.tournament.toLowerCase().includes('fifa'))
    );
  };

  const isMatchLive = (utcDateTimeStr: string) => {
    const matchTime = new Date(utcDateTimeStr).getTime();
    const durationMs = 3.5 * 60 * 60 * 1000; // 3.5 hour window
    return now >= matchTime && now <= matchTime + durationMs;
  };

  // Compile available streams for a live match (API streams + fallback direct HLS stream)
  const getStreamOptions = (matchTitle: string) => {
    const optionsList: { id: string; channel_name: string; url: string }[] = [];
    const liveEvent = findMatchingLiveEvent(matchTitle);

    if (liveEvent && liveEvent.channels && liveEvent.channels.length > 0) {
      liveEvent.channels.forEach(c => {
        optionsList.push({ id: c.id, channel_name: c.channel_name, url: c.url });
      });
    }

    // Always include the premium direct HLS playlist as a stable option
    optionsList.push({
      id: 'fallback-hls',
      channel_name: 'Premium HLS Live Feed',
      url: 'https://cdnlivetv.tv/secure/api/v1/6a288d2a81d8192bb76cc386/playlist.m3u8?token=NmEyODhkMmE4MWQ4MTkyYmI3NmNjMzg2OjE3ODI4OTE0NDAxMDQ6Y2RubGl2ZXR2LnR2OjUxMWNiZDJiZTUyNDI4Y2UuMTA0YzU5OWE5YTIyMGNjNjFjNjg3ZGM3NDc1NzFlYjM3M2M5NmUwMDUwNzNhMzBhYzAyYTYwZmY0YjIzMTAyNw'
    });

    return optionsList;
  };

  const handleWatchMatch = (matchTitle: string) => {
    const streams = getStreamOptions(matchTitle);
    const activeStream = streams[0]; // Start playing the first stream by default

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    // Route through ad-blocking player proxy if it's an iframe player url
    const playUrl = activeStream.url.includes('.m3u8')
      ? activeStream.url
      : `${apiBase}/channels/player-proxy?url=${encodeURIComponent(activeStream.url)}`;

    const targetChannel = {
      id: activeStream.id,
      name: matchTitle,
      streamUrl: playUrl,
      groupTitle: 'Live Streams',
      streams: streams // Forward streams list to the Player Modal overlay!
    };
    
    openPlayer(targetChannel);
  };

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
                {isLoading && (
                  <span className="inline-block w-4 h-4 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin ml-2 shrink-0" />
                )}
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
              {filteredMatches.map((match) => {
                const live = isMatchLive(match.utcDateTime);
                
                return (
                  <div 
                    key={match.id} 
                    className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 group shadow-lg relative overflow-hidden"
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-wider mb-4">
                        <span className="flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${live ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'}`} />
                          FIFA World Cup
                        </span>
                        <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-white/60 border border-white/5">
                          {live ? 'LIVE' : getLocalTimeString(match.utcDateTime)}
                        </span>
                      </div>

                      {/* Teams Display */}
                      <div className="flex items-center justify-center space-x-4 mb-4">
                        <div className="flex items-center space-x-3 flex-1 justify-end">
                          <span className="text-xs font-bold text-white truncate max-w-[80px] text-right">
                            {match.teams.home.name}
                          </span>
                          {match.teams.home.flagUrl && (
                            <img 
                              src={match.teams.home.flagUrl} 
                              alt={match.teams.home.name} 
                              className="w-8 h-8 object-contain shrink-0 filter drop-shadow-md rounded"
                            />
                          )}
                        </div>
                        
                        <span className="text-white/20 font-black text-[10px] italic uppercase tracking-wider shrink-0">VS</span>
                        
                        <div className="flex items-center space-x-3 flex-1 justify-start">
                          {match.teams.away.flagUrl && (
                            <img 
                              src={match.teams.away.flagUrl} 
                              alt={match.teams.away.name} 
                              className="w-8 h-8 object-contain shrink-0 filter drop-shadow-md rounded"
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
                      {live ? (
                        <button
                          onClick={() => handleWatchMatch(match.title)}
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
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default WorldCup;
