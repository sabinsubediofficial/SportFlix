import React, { useEffect, useRef, useState } from 'react';
import type { Channel } from '../services/api';
import { validateChannelById } from '../services/api';
import { Play } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface ChannelCardProps {
  channel: Channel;
  onClick: (channel: Channel) => void;
  searchMode?: 'local' | 'global';
}

const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick, searchMode = 'local' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState(channel.status || 'unknown');
  const [isValidating, setIsValidating] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const queryClient = useQueryClient();
  const [logoFailed, setLogoFailed] = useState(!channel.logo);

  // Sync with parent status if it updates (e.g. from polling)
  useEffect(() => {
    if (channel.status && channel.status !== 'unknown') {
      setStatus(channel.status);
    }
  }, [channel.status]);

  useEffect(() => {
    // Only auto-validate local channels that are currently "unknown"
    if (searchMode === 'global' || status !== 'unknown' || hasValidated || isValidating) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasValidated && !isValidating) {
          setIsValidating(true);
          validateChannelById(channel.id).then((res) => {
            setStatus(res.status);
            setIsValidating(false);
            setHasValidated(true);

            // Instantly update global cache to trigger automatic resort in parent
            queryClient.setQueriesData({ queryKey: ['channels'] }, (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) return oldData;
              return oldData.map((c: any) => c.id === channel.id ? { ...c, status: res.status } : c);
            });
          }).catch(() => {
            setIsValidating(false);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [channel.id, status, hasValidated, isValidating, searchMode, queryClient]);

  const getStatusColor = () => {
    if (status === 'online') return 'bg-emerald-500/80 text-white border-emerald-400/50';
    if (status === 'offline') return 'bg-rose-500/80 text-white border-rose-400/50';
    return 'bg-white/10 text-white/40 border-white/10';
  };

  const getStatusText = () => {
    if (status === 'online') return 'Working';
    if (status === 'offline') return 'Offline';
    if (isValidating) return 'Verifying...';
    return 'Checking';
  };

  return (
    <div 
      ref={cardRef}
      onClick={() => onClick(channel)}
      className="group relative cursor-pointer"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-blue-500/50 transition-all duration-500 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] group-hover:-translate-y-1">
        {channel.logo && !logoFailed ? (
          <img 
            src={channel.logo} 
            alt={channel.name} 
            onError={() => setLogoFailed(true)}
            className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700" 
          />
        ) : null}
        
        {/* Fallback Letter (Shown if no logo or image fails) */}
        {logoFailed ? (
          <div className="w-full h-full flex items-center justify-center text-5xl font-black text-white/10 italic">
            {channel.name.substring(0, 1).toUpperCase()}
          </div>
        ) : null}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-2xl scale-50 group-hover:scale-100 transition-transform duration-500">
            <Play className="w-6 h-6 text-black fill-current" />
          </div>
        </div>

        {/* Status Badge */}
        <div className={`absolute top-3 ${searchMode === 'global' ? 'left-3' : 'right-3'} text-[9px] font-black px-2 py-0.5 rounded-full tracking-tighter uppercase shadow-xl backdrop-blur-md border transition-all duration-300 ${getStatusColor()} ${(isValidating || status === 'unknown') ? 'animate-pulse' : ''}`}>
          {getStatusText()}
        </div>
      </div>
      
      <div className="mt-3 px-1">
        <h4 className="text-base font-bold text-white/90 group-hover:text-blue-400 transition-colors truncate">
          {channel.name}
        </h4>
        {channel.programs && channel.programs.length > 0 ? (
          <div className="mt-1">
            <p className="text-xs text-blue-500 font-black uppercase tracking-wider truncate">
              {channel.programs[0].title}
            </p>
            <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-0.5">
              {channel.groupTitle || 'General'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-white/30 font-bold uppercase tracking-widest mt-1">
            {channel.groupTitle || 'General'}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChannelCard;
