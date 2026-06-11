import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, BarChart3, Info, Play, Pause, Clock, Activity, TrendingUp } from 'lucide-react';

interface TeamRow {
  position: number;
  name: string;
  flag: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface Group {
  name: string;
  teams: TeamRow[];
}

interface MatchEvent {
  minute: number;
  type: 'goal' | 'card-yellow' | 'card-red' | 'info';
  team: 'home' | 'away' | 'none';
  detail: string;
}

interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: 'LIVE' | 'HT' | 'FT' | 'UPCOMING';
  stadium: string;
  group: string;
  stats: {
    possession: [number, number];
    shots: [number, number];
    shotsOnTarget: [number, number];
    corners: [number, number];
    fouls: [number, number];
  };
  timeline: MatchEvent[];
}

const BASE_GROUPS: Group[] = [
  {
    name: 'Group A',
    teams: [
      { position: 1, name: 'Mexico', flag: '🇲🇽', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 2, name: 'Korea Republic', flag: '🇰🇷', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 3, name: 'Czechia', flag: '🇨🇿', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 4, name: 'South Africa', flag: '🇿🇦', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ]
  },
  {
    name: 'Group B',
    teams: [
      { position: 1, name: 'Canada', flag: '🇨🇦', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 2, name: 'Switzerland', flag: '🇨🇭', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 3, name: 'Qatar', flag: '🇶🇦', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 4, name: 'Bosnia & Herzegovina', flag: '🇧🇦', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ]
  },
  {
    name: 'Group C',
    teams: [
      { position: 1, name: 'Brazil', flag: '🇧🇷', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 2, name: 'Morocco', flag: '🇲🇦', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 3, name: 'Scotland', flag: '🏴\u200d󠁢󠁳󠁣󠁴󠁿', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 4, name: 'Haiti', flag: '🇭🇹', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ]
  },
  {
    name: 'Group D',
    teams: [
      { position: 1, name: 'USA', flag: '🇺🇸', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 2, name: 'Türkiye', flag: '🇹🇷', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 3, name: 'Australia', flag: '🇦🇺', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
      { position: 4, name: 'Paraguay', flag: '🇵🇾', played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 },
    ]
  }
];

const Scoreboard: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([
    {
      id: 'm1',
      homeTeam: 'Mexico',
      awayTeam: 'South Africa',
      homeFlag: '🇲🇽',
      awayFlag: '🇿🇦',
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'UPCOMING',
      stadium: 'Estadio Azteca, Mexico City',
      group: 'Group A',
      stats: {
        possession: [50, 50],
        shots: [0, 0],
        shotsOnTarget: [0, 0],
        corners: [0, 0],
        fouls: [0, 0]
      },
      timeline: []
    },
    {
      id: 'm2',
      homeTeam: 'Korea Republic',
      awayTeam: 'Czechia',
      homeFlag: '🇰🇷',
      awayFlag: '🇨🇿',
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'UPCOMING',
      stadium: 'Estadio Guadalajara, Guadalajara',
      group: 'Group A',
      stats: {
        possession: [50, 50],
        shots: [0, 0],
        shotsOnTarget: [0, 0],
        corners: [0, 0],
        fouls: [0, 0]
      },
      timeline: []
    },
    {
      id: 'm3',
      homeTeam: 'Canada',
      awayTeam: 'Bosnia & Herzegovina',
      homeFlag: '🇨🇦',
      awayFlag: '🇧🇦',
      homeScore: 0,
      awayScore: 0,
      minute: 0,
      status: 'UPCOMING',
      stadium: 'Toronto Stadium, Toronto',
      group: 'Group B',
      stats: {
        possession: [50, 50],
        shots: [0, 0],
        shotsOnTarget: [0, 0],
        corners: [0, 0],
        fouls: [0, 0]
      },
      timeline: []
    }
  ]);

  const [activeMatchId, setActiveMatchId] = useState<string>('m1');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Active match helper
  const activeMatch = useMemo(() => {
    return liveMatches.find(m => m.id === activeMatchId);
  }, [liveMatches, activeMatchId]);

  // Simulator interval
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setLiveMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.status === 'LIVE') {
            const nextMin = match.minute + 1;
            let nextStatus: 'LIVE' | 'HT' | 'FT' | 'UPCOMING' = match.status;
            const newTimeline = [...match.timeline];
            let newHomeScore = match.homeScore;
            let newAwayScore = match.awayScore;

            if (nextMin === 45) {
              nextStatus = 'HT';
              newTimeline.push({
                minute: 45,
                type: 'info',
                team: 'none',
                detail: 'Half Time whistle. Teams head to dressing rooms.'
              });
            } else if (nextMin >= 90) {
              nextStatus = 'FT';
              newTimeline.push({
                minute: 90,
                type: 'info',
                team: 'none',
                detail: 'Full Time! Match concludes.'
              });
            }

            // Event generator (15% chance of goal/card/info)
            const eventChance = Math.random();
            const eventTeam = Math.random() > 0.5 ? 'home' : 'away';
            const teamName = eventTeam === 'home' ? match.homeTeam : match.awayTeam;

            if (eventChance < 0.04 && nextStatus === 'LIVE') {
              // GOAL!
              if (eventTeam === 'home') newHomeScore++; else newAwayScore++;
              const goalscorers: Record<string, string[]> = {
                Mexico: ['Raúl Jiménez', 'Santiago Giménez', 'Hirving Lozano', 'Orbelín Pineda'],
                'South Africa': ['Lyle Foster', 'Percy Tau', 'Teboho Mokoena', 'Themba Zwane'],
                'Korea Republic': ['Son Heung-min', 'Hwang Hee-chan', 'Lee Kang-in'],
                Czechia: ['Patrik Schick', 'Tomáš Souček', 'Adam Hložek'],
                Canada: ['Jonathan David', 'Alphonso Davies', 'Cyle Larin']
              };
              const teamList = goalscorers[teamName] || ['Striker'];
              const player = teamList[Math.floor(Math.random() * teamList.length)];
              newTimeline.push({
                minute: nextMin,
                type: 'goal',
                team: eventTeam,
                detail: `⚽ Goal! ${teamName} - ${player} scores!`
              });
            } else if (eventChance < 0.10 && nextStatus === 'LIVE') {
              // Yellow Card
              const players = ['Defender', 'Midfielder', 'Fullback', 'Winger'];
              const role = players[Math.floor(Math.random() * players.length)];
              newTimeline.push({
                minute: nextMin,
                type: 'card-yellow',
                team: eventTeam,
                detail: `🟨 Yellow Card - ${teamName}: ${role}`
              });
            } else if (eventChance < 0.11 && nextStatus === 'LIVE') {
              // Red Card
              newTimeline.push({
                minute: nextMin,
                type: 'card-red',
                team: eventTeam,
                detail: `🟥 Red Card - ${teamName}: Sent off!`
              });
            }

            // Stat adjustments
            const statsCopy = { ...match.stats };
            const homePos = Math.max(35, Math.min(65, statsCopy.possession[0] + (Math.random() > 0.5 ? 2 : -2)));
            statsCopy.possession = [homePos, 100 - homePos];

            if (Math.random() > 0.7) {
              if (Math.random() > 0.5) {
                statsCopy.shots[0]++;
                if (Math.random() > 0.5) statsCopy.shotsOnTarget[0]++;
              } else {
                statsCopy.shots[1]++;
                if (Math.random() > 0.5) statsCopy.shotsOnTarget[1]++;
              }
            }
            if (Math.random() > 0.8) {
              if (Math.random() > 0.5) statsCopy.corners[0]++; else statsCopy.corners[1]++;
            }
            if (Math.random() > 0.7) {
              if (Math.random() > 0.5) statsCopy.fouls[0]++; else statsCopy.fouls[1]++;
            }

            return {
              ...match,
              minute: nextMin,
              status: nextStatus,
              homeScore: newHomeScore,
              awayScore: newAwayScore,
              stats: statsCopy,
              timeline: newTimeline
            };
          } else if (match.status === 'HT') {
            // HT Resuming
            if (Math.random() > 0.6) {
              return {
                ...match,
                status: 'LIVE',
                minute: 46,
                timeline: [
                  ...match.timeline,
                  {
                    minute: 46,
                    type: 'info',
                    team: 'none',
                    detail: 'Second half gets underway.'
                  }
                ]
              };
            }
          }
          return match;
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  // Start match manually
  const startMatch = (id: string) => {
    setLiveMatches(prev => prev.map(m => {
      if (m.id === id && m.status === 'UPCOMING') {
        return {
          ...m,
          status: 'LIVE',
          minute: 1,
          timeline: [{ minute: 1, type: 'info', team: 'none', detail: 'Referee blows kickoff whistle! Match starts.' }]
        };
      }
      return m;
    }));
  };

  // Standings recalculator
  const groupsWithStandings = useMemo(() => {
    return BASE_GROUPS.map(group => {
      const teamsCopy = group.teams.map(t => ({ 
        ...t, 
        played: 0, 
        won: 0, 
        drawn: 0, 
        lost: 0, 
        goalsFor: 0, 
        goalsAgainst: 0, 
        points: 0 
      }));
      
      liveMatches.forEach(match => {
        if (match.group === group.name && match.status !== 'UPCOMING') {
          const home = teamsCopy.find(t => t.name === match.homeTeam);
          const away = teamsCopy.find(t => t.name === match.awayTeam);
          if (home && away) {
            home.played += 1;
            away.played += 1;
            home.goalsFor += match.homeScore;
            home.goalsAgainst += match.awayScore;
            away.goalsFor += match.awayScore;
            away.goalsAgainst += match.homeScore;
            
            if (match.homeScore > match.awayScore) {
              home.won += 1;
              home.points += 3;
              away.lost += 1;
            } else if (match.awayScore > match.homeScore) {
              away.won += 1;
              away.points += 3;
              home.lost += 1;
            } else {
              home.drawn += 1;
              home.points += 1;
              away.drawn += 1;
              away.points += 1;
            }
          }
        }
      });

      // Sort teams by points, goal diff, goals for
      teamsCopy.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalsFor - a.goalsAgainst;
        const gdB = b.goalsFor - b.goalsAgainst;
        if (gdB !== gdA) return gdB - gdA;
        return b.goalsFor - a.goalsFor;
      });

      // Re-assign positions
      teamsCopy.forEach((team, idx) => {
        team.position = idx + 1;
      });

      return {
        ...group,
        teams: teamsCopy
      };
    });
  }, [liveMatches]);

  return (
    <div className="min-h-screen bg-[#050505] pb-24">
      {/* Page Header Banner */}
      <div className="relative h-[280px] w-full overflow-hidden flex items-end bg-gradient-to-r from-indigo-900/10 via-transparent to-transparent">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#050505] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pb-8">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.25em]">Tournament Stats</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
              Live Standings
            </h1>
            <p className="text-white/50 text-base md:text-lg max-w-xl font-medium mt-3 leading-relaxed">
              Check the live team standings and positions for the 2026 FIFA World Cup groups. The top two teams in each group advance to the next round.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 max-w-[1400px] mx-auto pt-8 md:pt-10 space-y-8">
        {/* Info Alert */}
        <div className="flex items-start gap-3 p-5 bg-white/5 border border-white/5 rounded-2xl text-white/50 max-w-3xl">
          <Info className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold text-white mb-1">Qualification Format</p>
            <p>
              The 2026 World Cup features 12 groups of 4 teams. The top two teams from each group (highlighted in <span className="text-emerald-500 font-bold">green</span>) automatically qualify for the Round of 32, alongside the 8 best third-place finishers across all groups.
            </p>
          </div>
        </div>

        {/* Live Scoreboard Section */}
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500 animate-pulse" /> Live Match Tracker
              </h2>
              <p className="text-white/40 text-sm mt-1">Real-time simulation of matches. Changes immediately affect standings below.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isSimulating 
                    ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600 hover:text-white cursor-pointer'
                    : 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600 hover:text-white cursor-pointer'
                }`}
              >
                {isSimulating ? <Pause size={14} /> : <Play size={14} />}
                <span>{isSimulating ? 'Pause Simulation' : 'Resume Simulation'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left: Match List Selector */}
            <div className="space-y-3 lg:col-span-1 border-r border-white/5 pr-0 lg:pr-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Select Match to Track</p>
              {liveMatches.map((match) => {
                const isActive = match.id === activeMatchId;
                return (
                  <button
                    key={match.id}
                    onClick={() => setActiveMatchId(match.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                      isActive 
                        ? 'bg-blue-600/10 border-blue-500/30' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] font-bold text-white/40 uppercase">{match.group}</span>
                      {match.status === 'LIVE' && (
                        <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md text-[9px] font-black">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          LIVE {match.minute}'
                        </span>
                      )}
                      {match.status === 'HT' && (
                        <span className="bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md text-[9px] font-black">
                          HALF TIME
                        </span>
                      )}
                      {match.status === 'FT' && (
                        <span className="bg-white/10 text-white/50 px-2 py-0.5 rounded-md text-[9px] font-black">
                          FINISHED
                        </span>
                      )}
                      {match.status === 'UPCOMING' && (
                        <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md text-[9px] font-black">
                          UPCOMING
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xl filter drop-shadow">{match.homeFlag}</span>
                        <span className="text-sm font-black text-white truncate max-w-[100px]">{match.homeTeam}</span>
                      </div>
                      <span className="text-base font-black text-white">{match.status === 'UPCOMING' ? '-' : match.homeScore}</span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xl filter drop-shadow">{match.awayFlag}</span>
                        <span className="text-sm font-black text-white truncate max-w-[100px]">{match.awayTeam}</span>
                      </div>
                      <span className="text-base font-black text-white">{match.status === 'UPCOMING' ? '-' : match.awayScore}</span>
                    </div>

                    {match.status === 'UPCOMING' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startMatch(match.id);
                        }}
                        className="mt-1 w-full bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black py-2 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Kickoff Match
                      </button>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right: Active Match Details */}
            {activeMatch ? (
              <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
                {/* Big Scoreboard Display */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-3 left-4 text-[10px] font-black uppercase text-white/30 tracking-wider">
                    {activeMatch.group} • {activeMatch.stadium}
                  </div>

                  <div className="flex items-center justify-center gap-8 md:gap-12 mt-4 w-full">
                    {/* Home Team */}
                    <div className="flex flex-col items-center flex-1 text-center">
                      <span className="text-5xl filter drop-shadow-lg mb-2">{activeMatch.homeFlag}</span>
                      <span className="text-base md:text-lg font-black text-white">{activeMatch.homeTeam}</span>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-center">
                      <div className="text-4xl md:text-5xl font-black text-white tracking-wider flex items-center gap-3 bg-black/30 px-5 py-2.5 rounded-2xl border border-white/5 shadow-inner">
                        <span>{activeMatch.status === 'UPCOMING' ? '-' : activeMatch.homeScore}</span>
                        <span className="text-white/20 text-3xl font-light">:</span>
                        <span>{activeMatch.status === 'UPCOMING' ? '-' : activeMatch.awayScore}</span>
                      </div>
                      
                      <div className="mt-3">
                        {activeMatch.status === 'LIVE' && (
                          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <Clock size={12} className="animate-spin duration-1000" />
                            {activeMatch.minute}' Playing
                          </span>
                        )}
                        {activeMatch.status === 'HT' && (
                          <span className="text-xs text-amber-500 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            Half Time
                          </span>
                        )}
                        {activeMatch.status === 'FT' && (
                          <span className="text-xs text-white/60 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/5">
                            Full Time
                          </span>
                        )}
                        {activeMatch.status === 'UPCOMING' && (
                          <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                            Scheduled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center flex-1 text-center">
                      <span className="text-5xl filter drop-shadow-lg mb-2">{activeMatch.awayFlag}</span>
                      <span className="text-base md:text-lg font-black text-white">{activeMatch.awayTeam}</span>
                    </div>
                  </div>
                </div>

                {/* Grid for Stats & Events */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Match Stats */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white/40 flex items-center gap-2 pb-2 border-b border-white/5">
                      <TrendingUp size={14} className="text-blue-500" /> Match Stats
                    </h4>

                    {activeMatch.status === 'UPCOMING' ? (
                      <div className="h-full flex items-center justify-center text-center p-6 text-white/30 text-xs font-bold">
                        Stats will generate live once match kicks off.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {/* Possession bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-white/60">
                            <span>Possession</span>
                            <span>{activeMatch.stats.possession[0]}% vs {activeMatch.stats.possession[1]}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex">
                            <div className="bg-blue-600 h-full" style={{ width: `${activeMatch.stats.possession[0]}%` }} />
                            <div className="bg-indigo-400 h-full" style={{ width: `${activeMatch.stats.possession[1]}%` }} />
                          </div>
                        </div>

                        {/* Other stats in text comparison */}
                        {[
                          { name: 'Shots', key: 'shots' },
                          { name: 'Shots on Target', key: 'shotsOnTarget' },
                          { name: 'Corners', key: 'corners' },
                          { name: 'Fouls', key: 'fouls' }
                        ].map(stat => (
                          <div key={stat.name} className="flex justify-between items-center text-xs font-semibold py-1.5 border-b border-white/5 last:border-b-0">
                            <span className="text-white/60">{activeMatch.stats[stat.key as 'shots' | 'shotsOnTarget' | 'corners' | 'fouls'][0]}</span>
                            <span className="text-[10px] font-black uppercase text-white/30 tracking-wider">{stat.name}</span>
                            <span className="text-white/60">{activeMatch.stats[stat.key as 'shots' | 'shotsOnTarget' | 'corners' | 'fouls'][1]}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Match Timeline / Events */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between gap-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white/40 flex items-center gap-2 pb-2 border-b border-white/5">
                      <Clock size={14} className="text-blue-500" /> Match Events
                    </h4>

                    <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-1.5 no-scrollbar">
                      {activeMatch.timeline.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-center p-6 text-white/30 text-xs font-bold">
                          No events recorded yet.
                        </div>
                      ) : (
                        [...activeMatch.timeline].reverse().map((event, idx) => (
                          <div key={idx} className="flex gap-3 text-xs bg-black/20 p-2.5 rounded-xl border border-white/5 animate-in fade-in duration-300">
                            <span className="font-black text-blue-400 text-[10px]">{event.minute}'</span>
                            <span className="text-white/80 font-medium leading-normal">{event.detail}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {groupsWithStandings.map((group) => (
            <div 
              key={group.name} 
              className="bg-white/5 border border-white/5 rounded-2xl p-5 md:p-6 space-y-4 shadow-2xl hover:border-white/10 transition-colors duration-300"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-blue-500" /> {group.name}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Standings</span>
              </div>

              {/* Group Standings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/5">
                      <th className="py-3 pl-2 text-center w-10">Pos</th>
                      <th className="py-3">Team</th>
                      <th className="py-3 text-center w-10">P</th>
                      <th className="py-3 text-center w-8">W</th>
                      <th className="py-3 text-center w-8">D</th>
                      <th className="py-3 text-center w-8">L</th>
                      <th className="py-3 text-center w-12">GD</th>
                      <th className="py-3 text-center w-12 pr-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((team) => {
                      const isQualifyingZone = team.position <= 2;
                      return (
                        <tr 
                          key={team.name}
                          className={`border-b border-white/5 text-sm transition-colors duration-150 ${
                            isQualifyingZone ? 'hover:bg-emerald-500/5' : 'hover:bg-white/5'
                          }`}
                        >
                          {/* Position */}
                          <td className="py-4 text-center">
                            <span className={`inline-flex w-6 h-6 rounded-lg items-center justify-center font-bold text-xs ${
                              isQualifyingZone 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-white/5 text-white/40 border border-white/5'
                            }`}>
                              {team.position}
                            </span>
                          </td>
                          {/* Team Name */}
                          <td className="py-4 font-bold text-white">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl filter drop-shadow-sm">{team.flag}</span>
                              <span>{team.name}</span>
                            </div>
                          </td>
                          {/* Stats */}
                          <td className="py-4 text-center font-medium text-white/60">{team.played}</td>
                          <td className="py-4 text-center text-white/60">{team.won}</td>
                          <td className="py-4 text-center text-white/60">{team.drawn}</td>
                          <td className="py-4 text-center text-white/60">{team.lost}</td>
                          <td className="py-4 text-center text-white/60">
                            {team.goalsFor - team.goalsAgainst >= 0 ? '+' : ''}
                            {team.goalsFor - team.goalsAgainst}
                          </td>
                          {/* Points */}
                          <td className="py-4 text-center font-black pr-2">
                            <span className={isQualifyingZone ? 'text-emerald-400' : 'text-white'}>
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
