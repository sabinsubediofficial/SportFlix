import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Tv, Settings as SettingsIcon, Search as SearchIcon, PlayCircle, Maximize, Trophy, BarChart3 } from 'lucide-react';
import LiveTV from './pages/LiveTV';
import Settings from './pages/Settings';
import Search from './pages/Search';
import WorldCup from './pages/WorldCup';
import Scoreboard from './pages/Scoreboard';
import VideoPlayer from './components/VideoPlayer';
import { usePlayer } from './context/PlayerContext';

function App() {
  const location = useLocation();
  const { selectedChannel, isModalOpen, closePlayer, setIsModalOpen, setSelectedChannel } = usePlayer();

  const handlePiPChange = (isPiP: boolean) => {
    if (!isPiP && !isModalOpen) {
      setSelectedChannel(null);
    }
  };

  const navItems = [
    { path: '/', label: 'Live TV', icon: Tv },
    { path: '/worldcup', label: 'World Cup', icon: Trophy },
    { path: '/scoreboard', label: 'Scoreboard', icon: BarChart3 },
    { path: '/search', label: 'Search', icon: SearchIcon },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-blue-500/30 overflow-hidden flex">
      {/* Global Player Modal */}
      {selectedChannel && (
        <div className={`fixed inset-0 z-[100] bg-black transition-all duration-500 ${isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
          <div className="w-full h-full flex items-center justify-center">
            <VideoPlayer 
              url={selectedChannel.streamUrl} 
              channelName={selectedChannel.name}
              groupTitle={selectedChannel.groupTitle || 'General'}
              onBack={closePlayer}
              onPiPChange={handlePiPChange}
            />
          </div>
        </div>
      )}

      {/* Floating Mini Player / Re-open Button */}
      {selectedChannel && !isModalOpen && (
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 z-[60] bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl shadow-2xl shadow-blue-500/40 flex items-center space-x-4 animate-in slide-in-from-bottom-10 duration-500 group"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-white" />
          </div>
          <div className="text-left pr-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Now Playing</p>
            <p className="text-sm font-bold text-white truncate max-w-[150px]">{selectedChannel.name}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
            <Maximize className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* ultra-minimal glass sidebar */}
      <nav className="h-screen w-20 flex flex-col items-center py-8 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-50">
        <div className="mb-12">
          <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
            <PlayCircle className="w-7 h-7 text-white" />
          </div>
        </div>

        <div className="flex-1 flex flex-col space-y-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative group p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                
                {/* Tooltip style label */}
                <div className="absolute left-full ml-4 px-3 py-1 bg-white text-black text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.label}
                </div>
                
                {isActive && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Content Area */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth relative">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />
        <Routes>
          <Route path="/" element={<LiveTV />} />
          <Route path="/worldcup" element={<WorldCup />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </main>

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #050505;
        }
        ::-webkit-scrollbar-thumb {
          background: #222;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #333;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default App;
