import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchChannels } from '../services/api';
import ChannelCard from '../components/ChannelCard';
import { usePlayer } from '../context/PlayerContext';
import { Trophy, Calendar, Tv, Activity, Play, AlertCircle } from 'lucide-react';

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  group: string;
  stadium: string;
  utcDateTime: string;
  broadcasters: { name: string; searchKey: string }[];
}

const getChannelLanguage = (name: string): string => {
  const lower = name.toLowerCase();
  if (
    lower.includes('bbc') ||
    lower.includes('itv1') ||
    lower.includes('tsn') ||
    lower.includes('fox sports') ||
    lower.includes('bein') ||
    (lower.includes('itv') && lower.includes('480p'))
  ) {
    return 'English';
  }
  if (
    lower.includes('telemundo') ||
    lower.includes('fox deportes') ||
    lower.includes('itv deportes')
  ) {
    return 'Spanish';
  }
  if (
    lower.includes('caze') ||
    lower.includes('rtp')
  ) {
    return 'Portuguese';
  }
  if (
    lower.includes('trt')
  ) {
    return 'Turkish';
  }
  if (
    lower.includes('tvri')
  ) {
    return 'Indonesian';
  }
  if (
    lower.includes('thai pbs')
  ) {
    return 'Thai';
  }
  if (
    lower.includes('cctv')
  ) {
    return 'Chinese';
  }
  if (
    lower.includes('das erste') ||
    lower.includes('zdf')
  ) {
    return 'German';
  }
  return 'Other';
};

const matches: Match[] = [
  {
    id: 'm1',
    homeTeam: 'Mexico',
    awayTeam: 'South Africa',
    homeFlag: '🇲🇽',
    awayFlag: '🇿🇦',
    group: 'Group A',
    stadium: 'Estadio Azteca, Mexico City',
    utcDateTime: '2026-06-11T15:00:00Z',
    broadcasters: [
      { name: 'Fox Deportes', searchKey: 'fox deportes' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TRT 1', searchKey: 'trt 1' },
      { name: 'TVRI Sport', searchKey: 'tvri sport' }
    ]
  },
  {
    id: 'm2',
    homeTeam: 'Korea Republic',
    awayTeam: 'Czechia',
    homeFlag: '🇰🇷',
    awayFlag: '🇨🇿',
    group: 'Group A',
    stadium: 'Estadio Guadalajara, Guadalajara',
    utcDateTime: '2026-06-11T18:00:00Z',
    broadcasters: [
      { name: 'Fox Deportes', searchKey: 'fox deportes' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TVRI', searchKey: 'tvri' }
    ]
  },
  {
    id: 'm3',
    homeTeam: 'Canada',
    awayTeam: 'Bosnia & Herzegovina',
    homeFlag: '🇨🇦',
    awayFlag: '🇧🇦',
    group: 'Group B',
    stadium: 'Toronto Stadium, Toronto',
    utcDateTime: '2026-06-12T16:00:00Z',
    broadcasters: [
      { name: 'TSN The Ocho', searchKey: 'tsn the ocho' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'Thai PBS', searchKey: 'thai pbs' }
    ]
  },
  {
    id: 'm4',
    homeTeam: 'USA',
    awayTeam: 'Paraguay',
    homeFlag: '🇺🇸',
    awayFlag: '🇵🇾',
    group: 'Group D',
    stadium: 'Los Angeles Stadium, Los Angeles',
    utcDateTime: '2026-06-12T19:00:00Z',
    broadcasters: [
      { name: 'Fox Deportes', searchKey: 'fox deportes' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TVRI Sport', searchKey: 'tvri sport' }
    ]
  },
  {
    id: 'm5',
    homeTeam: 'Qatar',
    awayTeam: 'Switzerland',
    homeFlag: '🇶🇦',
    awayFlag: '🇨🇭',
    group: 'Group B',
    stadium: 'San Francisco Bay Area Stadium',
    utcDateTime: '2026-06-13T14:00:00Z',
    broadcasters: [
      { name: 'ITV Deportes', searchKey: 'itv deportes' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TRT 1', searchKey: 'trt 1' },
      { name: 'TVRI', searchKey: 'tvri' }
    ]
  },
  {
    id: 'm6',
    homeTeam: 'Brazil',
    awayTeam: 'Morocco',
    homeFlag: '🇧🇷',
    awayFlag: '🇲🇦',
    group: 'Group C',
    stadium: 'MetLife Stadium, New York/NJ',
    utcDateTime: '2026-06-13T17:00:00Z',
    broadcasters: [
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TRT 1', searchKey: 'trt 1' },
      { name: 'TVRI Sport', searchKey: 'tvri sport' }
    ]
  },
  {
    id: 'm7',
    homeTeam: 'Haiti',
    awayTeam: 'Scotland',
    homeFlag: '🇭🇹',
    awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
    group: 'Group C',
    stadium: 'Gillette Stadium, Boston',
    utcDateTime: '2026-06-13T20:00:00Z',
    broadcasters: [
      { name: 'ITV Deportes', searchKey: 'itv deportes' },
      { name: 'TSN The Ocho', searchKey: 'tsn the ocho' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TVRI', searchKey: 'tvri' }
    ]
  },
  {
    id: 'm8',
    homeTeam: 'Australia',
    awayTeam: 'Türkiye',
    homeFlag: '🇦🇺',
    awayFlag: '🇹🇷',
    group: 'Group D',
    stadium: 'BC Place, Vancouver',
    utcDateTime: '2026-06-13T23:00:00Z',
    broadcasters: [
      { name: 'TRT 1', searchKey: 'trt 1' },
      { name: 'CazeTV', searchKey: 'cazetv' },
      { name: 'TVRI Sport', searchKey: 'tvri sport' }
    ]
  }
];

const getLocalDateString = (utcDateTime: string) => {
  const dateObj = new Date(utcDateTime);
  return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const getLocalTimeString = (utcDateTime: string) => {
  const dateObj = new Date(utcDateTime);
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const getTabLabel = (dateStr: string) => {
  const dateObj = new Date(dateStr + ', 2026');
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  return `${dayName} - ${dateStr}`;
};

const dateTabs = Array.from(new Set(matches.map(m => getLocalDateString(m.utcDateTime)))).sort((a, b) => {
  return new Date(a + ', 2026').getTime() - new Date(b + ', 2026').getTime();
});

const WorldCup = () => {
  const { openPlayer } = usePlayer();
  const [selectedDate, setSelectedDate] = useState<string>(dateTabs[0] || 'June 11');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [activeSubTab, setActiveSubTab] = useState<'live' | 'schedule'>('live');

  // Fetch general channel registry
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => fetchChannels(),
    refetchInterval: 60000,
  });

  // Filter World Cup specific channels
  const wcChannels = useMemo(() => {
    return channels.filter(channel => {
      const name = channel.name.toLowerCase();
      return (
        name.includes('fox deportes') ||
        name.includes('tsn the ocho') ||
        name.includes('itv deportes') ||
        name.includes('t sports') ||
        name.includes('cctv-16') ||
        name.includes('cctv-storm football') ||
        name.includes('fox sports 1') ||
        name.includes('bein sports xtra') ||
        name.includes('bbc one') ||
        name.includes('bbc two') ||
        name.includes('itv1') ||
        name.includes('cazetv') ||
        name.includes('caze tv') ||
        name.includes('trt 1') ||
        name.includes('trt1') ||
        name.includes('trt spor') ||
        name.includes('tvri') ||
        name.includes('thai pbs') ||
        name.includes('telemundo') ||
        name.includes('das erste') ||
        name.includes('zdf') ||
        name.includes('rtp 1') ||
        name.includes('rtp1') ||
        (name.includes('itv') && name.includes('480p'))
      );
    });
  }, [channels]);

  // Filter based on selected language
  const filteredWcChannels = useMemo(() => {
    if (selectedLanguage === 'All') return wcChannels;
    return wcChannels.filter(c => getChannelLanguage(c.name) === selectedLanguage);
  }, [wcChannels, selectedLanguage]);

  // Split into working and offline groups
  const workingChannels = useMemo(() => {
    return filteredWcChannels.filter(c => c.status === 'online');
  }, [filteredWcChannels]);

  const offlineChannels = useMemo(() => {
    return filteredWcChannels.filter(c => c.status !== 'online');
  }, [filteredWcChannels]);

  const filteredMatches = useMemo(() => {
    return matches.filter(match => getLocalDateString(match.utcDateTime) === selectedDate);
  }, [selectedDate]);

  // Handler to stream a channel matching the broadcaster searchKey
  const handleWatchChannel = (searchKey: string) => {
    const targetChannel = channels.find(c => c.name.toLowerCase().includes(searchKey));
    if (targetChannel) {
      openPlayer(targetChannel);
    } else {
      alert(`Broadcaster stream not found in library. Go to Search to discover it.`);
    }
  };

  const isChannelOnline = (searchKey: string): boolean => {
    const ch = channels.find(c => c.name.toLowerCase().includes(searchKey));
    return ch?.status === 'online';
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#050505]">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-t-2 border-blue-500 rounded-full animate-spin" />
        <div className="mt-8 text-center text-white/40 font-black tracking-widest uppercase text-xs">Loading Cup Schedules</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      {/* World Cup Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden flex items-end p-12 md:p-20">
        {/* Background Image with Dark Golden Gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[3000ms] scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=2000')` 
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/40" />
        </div>
        
        <div className="relative z-10 max-w-4xl">
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

      <div className="px-12 md:px-20 max-w-7xl mx-auto mt-10">
        {/* Modern Sub-tab switcher */}
        <div className="flex border-b border-white/5 mb-10 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveSubTab('live')}
            className={`relative pb-4 px-6 font-black tracking-tight text-lg transition-all flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'live' ? 'text-blue-500' : 'text-white/40 hover:text-white'
            }`}
          >
            <Tv className="w-5 h-5" />
            <span>Live Broadcasts</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {activeSubTab === 'live' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`relative pb-4 px-6 font-black tracking-tight text-lg transition-all flex items-center space-x-2 shrink-0 ${
              activeSubTab === 'schedule' ? 'text-blue-500' : 'text-white/40 hover:text-white'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span>Match Schedules</span>
            {activeSubTab === 'schedule' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
            )}
          </button>
        </div>

        {activeSubTab === 'schedule' ? (
          /* Match Schedule Section */
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Calendar className="text-blue-500" /> Match Schedules
                </h2>
                <p className="text-white/40 text-sm mt-1">Official matches for the opening days</p>
              </div>

              {/* Date Tabs */}
              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
                {dateTabs.map((date) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      selectedDate === date 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {getTabLabel(date)}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMatches.map((match) => (
                <div 
                  key={match.id} 
                  className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/20 transition-all duration-300 group shadow-lg"
                >
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-black text-white/30 uppercase tracking-wider mb-4">
                      <span>{match.group}</span>
                      <span className="bg-white/5 px-2.5 py-0.5 rounded-md text-white/60 border border-white/5">{getLocalTimeString(match.utcDateTime)}</span>
                    </div>

                    {/* Teams Display */}
                    <div className="flex items-center justify-center space-x-4 mb-4">
                      <div className="flex items-center space-x-2 flex-1 justify-end">
                        <span className="text-sm font-bold text-white truncate max-w-[100px]">{match.homeTeam}</span>
                        <span className="text-2xl filter drop-shadow-md shrink-0">{match.homeFlag}</span>
                      </div>
                      
                      <span className="text-white/20 font-black text-xs italic uppercase tracking-wider shrink-0">VS</span>
                      
                      <div className="flex items-center space-x-2 flex-1 justify-start">
                        <span className="text-2xl filter drop-shadow-md shrink-0">{match.awayFlag}</span>
                        <span className="text-sm font-bold text-white truncate max-w-[100px]">{match.awayTeam}</span>
                      </div>
                    </div>

                    <p className="text-center text-[10px] text-white/30 font-medium mb-4 truncate">
                      📍 {match.stadium}
                    </p>
                  </div>

                  {/* Broadcaster Quick Play Buttons */}
                  <div className="border-t border-white/5 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {match.broadcasters.map((b) => {
                        const online = isChannelOnline(b.searchKey);
                        return (
                          <button
                            key={b.name}
                            onClick={() => handleWatchChannel(b.searchKey)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                              online 
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white cursor-pointer' 
                                : 'bg-white/5 text-white/30 border-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                            }`}
                          >
                            <Play size={8} className="fill-current" />
                            <span>{b.name}</span>
                            <span className={`w-1 h-1 rounded-full ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Broadcast Library Section */
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                  <Tv className="text-blue-500" /> World Cup Broadcast Library
                </h2>
                <p className="text-white/40 text-sm mt-1">Dedicated channels allocated for global streams</p>
              </div>

              {/* Language Tabs */}
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'All', name: 'All', flag: '🌍' },
                  { code: 'English', name: 'English', flag: '🇬🇧' },
                  { code: 'Spanish', name: 'Spanish', flag: '🇪🇸' },
                  { code: 'Portuguese', name: 'Portuguese', flag: '🇵🇹' },
                  { code: 'German', name: 'German', flag: '🇩🇪' },
                  { code: 'Chinese', name: 'Chinese', flag: '🇨🇳' },
                  { code: 'Indonesian', name: 'Indonesian', flag: '🇮🇩' },
                  { code: 'Turkish', name: 'Turkish', flag: '🇹🇷' },
                  { code: 'Thai', name: 'Thai', flag: '🇹🇭' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedLanguage === lang.code
                        ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Working Streams */}
            <div className="space-y-6">
              <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                <Activity size={16} /> Online Streams
              </h3>
              {workingChannels.length === 0 ? (
                <div className="flex items-center gap-3 p-6 bg-white/5 border border-white/5 rounded-2xl text-white/40">
                  <AlertCircle size={20} />
                  <p className="font-bold text-sm">No channels are currently online. Running validators shortly...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {workingChannels.map(channel => (
                    <div key={channel.id} className="virtual-card-container">
                      <ChannelCard 
                        channel={channel} 
                        onClick={openPlayer} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offline/Dead Streams */}
            <div className="space-y-6 pt-6">
              <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
                <AlertCircle size={16} /> Offline / Restricted Streams
              </h3>
              {offlineChannels.length === 0 ? (
                <div className="flex items-center gap-3 p-6 bg-white/5 border border-white/5 rounded-2xl text-white/40">
                  <AlertCircle size={20} />
                  <p className="font-bold text-sm">All selected library streams are online.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 opacity-60">
                  {offlineChannels.map(channel => (
                    <div key={channel.id} className="virtual-card-container">
                      <ChannelCard 
                        channel={channel} 
                        onClick={openPlayer} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default WorldCup;
