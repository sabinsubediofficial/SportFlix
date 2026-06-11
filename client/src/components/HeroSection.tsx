import React from 'react';
import type { Channel } from '../services/api';
import { Play, Info } from 'lucide-react';

interface HeroSectionProps {
  featuredChannel?: Channel;
  onWatchNow: (channel: Channel) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ featuredChannel, onWatchNow }) => {
  if (!featuredChannel) return null;

  return (
    <div className="relative w-full h-[85vh] -mt-10 overflow-hidden group">
      {/* Background with advanced gradient masking */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out group-hover:scale-110"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1540747737956-37872e7e9fc9?auto=format&fit=crop&q=80&w=2000')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30" />
      </div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center px-12 md:px-20 max-w-4xl">
        <div className="flex items-center space-x-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="bg-red-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
            Live Now
          </div>
          <span className="text-white/60 text-sm font-bold tracking-widest uppercase">
            {featuredChannel.groupTitle || 'Featured Stream'}
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6 animate-in fade-in slide-in-from-left-6 duration-1000">
          {featuredChannel.logo && (
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-2xl shrink-0 flex items-center justify-center shadow-2xl">
              <img src={featuredChannel.logo} alt="" className="w-full h-full object-contain" />
            </div>
          )}
          <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
            {featuredChannel.name}
          </h1>
        </div>
        
        <p className="text-white/70 text-xl mb-10 max-w-2xl leading-relaxed font-medium animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
          Experience the best in live broadcasting. Stream {featuredChannel.name} and hundreds of other premium channels with ultra-low latency and crystal-clear quality.
        </p>
        
        <div className="flex space-x-4 animate-in fade-in slide-in-from-left-10 duration-1000 delay-500">
          <button 
            onClick={() => onWatchNow(featuredChannel)}
            className="bg-white text-black hover:bg-blue-500 hover:text-white px-10 py-4 rounded-2xl font-black flex items-center space-x-3 transition-all transform active:scale-95 shadow-xl shadow-white/5 hover:shadow-blue-500/40"
          >
            <Play className="w-6 h-6 fill-current" />
            <span className="text-lg">Watch Now</span>
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-black backdrop-blur-xl border border-white/10 transition-all flex items-center space-x-3">
            <Info className="w-6 h-6" />
            <span className="text-lg">Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
