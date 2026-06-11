import React from 'react';
import { Trophy, BarChart3, Info } from 'lucide-react';

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

const Scoreboard: React.FC = () => {
  const groups: Group[] = [
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

  return (
    <div className="min-h-screen bg-[#050505] pb-20">
      {/* Page Header Banner */}
      <div className="relative h-[300px] w-full overflow-hidden flex items-end p-12 md:p-20 bg-gradient-to-r from-indigo-900/10 via-transparent to-transparent">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-[#050505] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.25em]">Tournament Stats</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter drop-shadow-2xl">
            Live Standings
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-xl font-medium mt-3 leading-relaxed">
            Check the live team standings and positions for the 2026 FIFA World Cup groups. The top two teams in each group advance to the next round.
          </p>
        </div>
      </div>

      <div className="px-12 md:px-20 max-w-7xl mx-auto space-y-16">
        {/* Info Alert */}
        <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/5 rounded-3xl text-white/50 max-w-3xl">
          <Info className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold text-white mb-1">Qualification Format</p>
            <p>
              The 2026 World Cup features 12 groups of 4 teams. The top two teams from each group (highlighted in <span className="text-emerald-500 font-bold">green</span>) automatically qualify for the Round of 32, alongside the 8 best third-place finishers across all groups.
            </p>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {groups.map((group) => (
            <div 
              key={group.name} 
              className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl hover:border-white/10 transition-colors duration-300"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-amber-500" /> {group.name}
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
                          <td className="py-4 font-bold text-white flex items-center gap-3">
                            <span className="text-2xl filter drop-shadow-sm">{team.flag}</span>
                            <span>{team.name}</span>
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
