import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchChannels, searchIptvOrg, importChannels } from '../services/api';
import { Search as SearchIcon, Tv, X, Loader2, Globe, Library, Plus } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import ChannelCard from '../components/ChannelCard';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'local' | 'global'>('local');
  const { openPlayer } = usePlayer();
  const queryClient = useQueryClient();

  // Debounce search query to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels', searchMode, debouncedQuery],
    queryFn: () => searchMode === 'local' ? fetchChannels(debouncedQuery) : searchIptvOrg(debouncedQuery),
    enabled: debouncedQuery.length > 0,
    refetchInterval: searchMode === 'local' ? 5000 : false,
  });

  const importMutation = useMutation({
    mutationFn: (channel: any) => importChannels({ 
      useApi: true, 
      query: channel.name,
      limit: 1,
      name: `Import: ${channel.name}` 
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    }
  });

  return (
    <div className="min-h-screen bg-[#050505] pt-32 px-12 md:px-20 pb-20">
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-16">
        <h1 className="text-6xl font-black text-white mb-8 tracking-tighter text-glow italic">
          {searchMode === 'local' ? 'Library Search' : 'Global Discovery'}
        </h1>
        
        {/* Mode Toggle */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setSearchMode('local')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${searchMode === 'local' ? 'bg-blue-600 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            <Library size={20} />
            My Library
          </button>
          <button 
            onClick={() => setSearchMode('global')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${searchMode === 'global' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            <Globe size={20} />
            IPTV-org Global
          </button>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            {isLoading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            ) : (
              <SearchIcon className="w-8 h-8 text-white/20 group-focus-within:text-blue-500 transition-colors" />
            )}
          </div>
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchMode === 'local' ? "Search your sports library..." : "Search global sports channels..."}
            className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-8 pl-20 pr-8 text-2xl font-bold text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-2xl"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-6 flex items-center"
            >
              <X className="w-8 h-8 text-white/20 hover:text-white transition-colors" />
            </button>
          )}
        </div>
        <p className="mt-4 text-white/20 text-xs font-bold uppercase tracking-[0.3em] pl-6">
          {searchMode === 'local' 
            ? "Searching your sports collection" 
            : "Querying global database for live sports & World Cup streams"}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {channels.map((channel: any) => (
          <div 
            key={channel.id || channel.tvgId || channel.streamUrl}
            className="group relative virtual-card-container"
          >
            <ChannelCard 
              channel={channel} 
              onClick={openPlayer} 
              searchMode={searchMode}
            />

            {/* Import Button (Only for Global Mode) */}
            {searchMode === 'global' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  importMutation.mutate(channel);
                }}
                disabled={importMutation.isPending}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
                title="Add to Library"
              >
                {importMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={20} />}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Empty States */}
      {!searchQuery && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
          <SearchIcon className="w-24 h-24 mb-6" />
          <p className="text-2xl font-black italic">Start typing to discover content</p>
        </div>
      )}

      {searchQuery && channels.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
            <Tv className="w-12 h-12" />
          </div>
          <p className="text-2xl font-black">No channels found for "{searchQuery}"</p>
          <p className="text-sm font-bold uppercase tracking-widest mt-2 text-white/20">Try a different keyword</p>
        </div>
      )}
    </div>
  );
};

export default Search;
