import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { importChannels } from '../services/api';
import { Download, Globe, Info, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
  const [url, setUrl] = useState('https://iptv-org.github.io/iptv/index.m3u');
  const [name, setName] = useState('IPTV-org');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => importChannels({ url, name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto pt-24 pb-24 px-6 md:px-12 lg:px-16">
      <div className="mb-12">
        <h2 className="text-4xl font-black mb-3">Settings</h2>
        <p className="text-gray-500">Configure your sources and application preferences.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center space-x-2 text-blue-400">
                <Download className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Import Content</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Playlist Provider Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. My Premium IPTV"
                      className="w-full pl-4 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white font-medium"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">M3U Playlist URL</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Globe className="h-5 w-5 text-gray-600" />
                    </div>
                    <input 
                      type="text" 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com/playlist.m3u"
                      className="w-full pl-12 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className={`group w-full py-3.5 rounded-xl font-black text-lg transition-all flex items-center justify-center space-x-3 ${
                  mutation.isPending 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:shadow-blue-900/40 active:scale-[0.98]'
                }`}
              >
                {mutation.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Playlist...</span>
                  </>
                ) : (
                  <>
                    <span>Import Playlist</span>
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  </>
                )}
              </button>

              {mutation.isSuccess && (
                <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-500 animate-in fade-in zoom-in duration-300">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p className="font-bold">Content imported successfully! Visit Live TV to watch.</p>
                </div>
              )}

              {mutation.isError && (
                <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 animate-in fade-in zoom-in duration-300">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="font-bold">Import failed. Please check the URL and try again.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-800 bg-gray-900/50">
              <div className="flex items-center space-x-2 text-amber-500">
                <Globe className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Featured Playlists</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-500 font-medium">
                Select a free preconfigured TV stream provider to populate the form above:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Pluto TV (All FAST Channels)',
                    url: 'https://i.mjh.nz/PlutoTV/all.m3u8',
                    desc: 'Hundreds of live, high-quality TV channels in various languages.'
                  },
                  {
                    name: 'Samsung TV Plus (US FAST)',
                    url: 'https://i.mjh.nz/SamsungTVPlus/us.m3u8',
                    desc: 'Popular news, sports, entertainment and weather streams.'
                  },
                  {
                    name: 'Roku Channel (US FAST)',
                    url: 'https://i.mjh.nz/Roku/us.m3u8',
                    desc: 'Free linear TV channels directly from Roku ecosystem.'
                  },
                  {
                    name: 'Plex TV (US FAST)',
                    url: 'https://i.mjh.nz/Plex/us.m3u8',
                    desc: 'Free ad-supported television streams.'
                  },
                  {
                    name: 'IPTV-org (Sports List)',
                    url: 'https://iptv-org.github.io/iptv/categories/sports.m3u',
                    desc: 'Global sports streaming channels collection.'
                  },
                  {
                    name: 'Free-TV/IPTV (Global)',
                    url: 'https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8',
                    desc: 'Legal, free-to-air international networks.'
                  }
                ].map((source) => (
                  <button
                    key={source.name}
                    onClick={() => {
                      setName(source.name);
                      setUrl(source.url);
                    }}
                    className="p-4 bg-gray-950 hover:bg-white/5 border border-gray-800 hover:border-gray-700 rounded-xl text-left transition-all group flex flex-col justify-between h-full"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                        {source.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {source.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-gray-600 mt-3 block truncate">
                      {source.url}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Info/Help */}
        <div className="space-y-8">
          <section className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center space-x-2 text-gray-400 mb-4">
              <Info className="w-5 h-5" />
              <h3 className="font-bold uppercase tracking-widest text-xs">Help & Tips</h3>
            </div>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <p>M3U playlists can contain thousands of channels. Importing may take a few seconds.</p>
              </li>
              <li className="flex space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <p>We support standard M3U and M3U8 formats used by most IPTV providers.</p>
              </li>
              <li className="flex space-x-3">
                <span className="text-blue-500 font-bold">•</span>
                <p>Ensure your provider allows CORS or use a proxy if you encounter connection issues.</p>
              </li>
            </ul>
          </section>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800">
            <h4 className="text-white font-bold mb-1">SportFlix Pro</h4>
            <p className="text-xs text-gray-500 mb-3">You are currently using the open-source version of SportFlix.</p>
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full w-1/3 bg-blue-600 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
