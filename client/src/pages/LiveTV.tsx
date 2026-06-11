import { useMemo, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchChannels } from '../services/api';

import HeroSection from '../components/HeroSection';
import ChannelCard from '../components/ChannelCard';
import { Tv, ArrowDownAZ, Activity, Star } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

type SortOption = 'working' | 'popularity' | 'working_popularity' | 'az';

const LiveTV = () => {
  const { openPlayer, isModalOpen } = usePlayer();
  const [sortBy, setSortBy] = useState<SortOption>('working_popularity');
  
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => fetchChannels(),
    refetchInterval: 60000, // Optimize: Refetch EPG/channels every 60s
  });

  const getStatusWeight = (status?: string) => {
    if (status === 'online') return 3;
    if (status === 'offline') return 1;
    return 2; // unknown
  };

  const sortedChannels = useMemo(() => {
    const sorted = [...channels];
    
    switch (sortBy) {
      case 'working':
        sorted.sort((a, b) => {
          const weightDiff = getStatusWeight(b.status) - getStatusWeight(a.status);
          if (weightDiff !== 0) return weightDiff;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'popularity':
        sorted.sort((a, b) => {
          const popDiff = (b.popularity || 0) - (a.popularity || 0);
          if (popDiff !== 0) return popDiff;
          const weightDiff = getStatusWeight(b.status) - getStatusWeight(a.status);
          if (weightDiff !== 0) return weightDiff;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'working_popularity':
        sorted.sort((a, b) => {
          const weightDiff = getStatusWeight(b.status) - getStatusWeight(a.status);
          if (weightDiff !== 0) return weightDiff;
          const popDiff = (b.popularity || 0) - (a.popularity || 0);
          if (popDiff !== 0) return popDiff;
          return a.name.localeCompare(b.name);
        });
        break;
      case 'az':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return sorted;
  }, [channels, sortBy]);

  // Featured channel for the hero section
  const featuredChannel = useMemo(() => {
    return sortedChannels.length > 0 ? sortedChannels[0] : undefined;
  }, [sortedChannels]);

  // Lock scroll when player is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isModalOpen]);

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#050505]">
      <div className="relative">
        <div className="w-24 h-24 border-2 border-white/5 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-t-2 border-blue-500 rounded-full animate-spin" />
        <div className="mt-8 text-center text-white/40 font-black tracking-widest uppercase text-xs">Initializing Stream Engine</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className={`transition-all duration-700 ${isModalOpen ? 'scale-95 blur-2xl opacity-0' : 'scale-100 blur-0 opacity-100'}`}>
        <HeroSection featuredChannel={featuredChannel} onWatchNow={openPlayer} />
        
        <div className="relative z-10 -mt-10 px-12 md:px-20 pb-20 max-w-7xl mx-auto">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black text-white tracking-tighter">Live Sports</h2>
              <p className="text-white/40 font-medium mt-1">
                {channels.length} channels loaded
              </p>
            </div>

            {/* Sort Controls */}
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSortBy('working')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  sortBy === 'working' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity size={16} />
                Working
              </button>
              <button
                onClick={() => setSortBy('popularity')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  sortBy === 'popularity' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Star size={16} />
                Popularity
              </button>
              <button
                onClick={() => setSortBy('working_popularity')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  sortBy === 'working_popularity' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Activity size={16} /> + <Star size={16} />
                Best Streams
              </button>
              <button
                onClick={() => setSortBy('az')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                  sortBy === 'az' ? 'bg-white text-black shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <ArrowDownAZ size={16} />
                A-Z
              </button>
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedChannels.map(channel => (
              <div key={channel.id} className="virtual-card-container">
                <ChannelCard 
                  channel={channel} 
                  onClick={openPlayer} 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {channels.length === 0 && !isLoading && (
        <div className="h-screen flex flex-col items-center justify-center text-center px-4">
          <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center mb-10 border border-white/5 shadow-2xl">
            <Tv className="w-16 h-16 text-white/10" />
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">No Channels Synchronized</h2>
          <p className="text-white/40 max-w-md mb-12 font-medium leading-relaxed text-lg">
            We couldn't find any channels in your library. Our auto-sync engine will attempt to pull from IPTV-org shortly.
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-black px-10 py-4 rounded-2xl font-black transition-all hover:scale-105 active:scale-95"
            >
              Force Sync
            </button>
            <Link to="/settings" className="bg-white/10 text-white px-10 py-4 rounded-2xl font-black transition-all hover:bg-white/20">
              Provider Settings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTV;
