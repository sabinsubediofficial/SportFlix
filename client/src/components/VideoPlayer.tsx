import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ExternalLink,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  channelName?: string;
  groupTitle?: string;
  onBack?: () => void;
  onPiPChange?: (isPiP: boolean) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const [playerKey, setPlayerKey] = useState(0);

  const handleRetry = useCallback(() => {
    setPlayerKey(prev => prev + 1);
  }, []);

  return <VideoPlayerInternal key={playerKey} {...props} onRetry={handleRetry} />;
};

interface InternalProps extends VideoPlayerProps {
  onRetry: () => void;
}

const VideoPlayerInternal: React.FC<InternalProps> = ({ 
  url, 
  autoPlay = true,
  channelName,
  groupTitle,
  onBack,
  onPiPChange,
  onRetry
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState(false);
  const controlsTimeoutRef = useRef<any>(null);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(e => setError("Playback failed: " + e.message));
      } else {
        videoRef.current.pause();
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        setError(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err: any) {
        setError(`PiP failed: ${err.message}`);
      }
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    setUseProxy(false);
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    setError(null);
    setIsBuffering(true);

    const streamUrl = useProxy 
      ? `http://localhost:5000/api/channels/stream-proxy?url=${encodeURIComponent(url)}` 
      : url;

    const setupHls = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingMaxRetry: 4,
          levelLoadingMaxRetry: 4
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('HLS Fatal Error:', data);
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR && !useProxy) {
              console.log('Network error encountered. Retrying stream via backend CORS proxy...');
              setUseProxy(true);
              return;
            }
            const isRestrictedChannel = channelName && (
              channelName.toLowerCase().includes('bbc') || 
              channelName.toLowerCase().includes('fox') || 
              channelName.toLowerCase().includes('bein')
            );
            
            const customErrorMessage = isRestrictedChannel
              ? "This stream is currently offline or restricted in your region. Please try alternative active streams like ITV Deportes or TSN The Ocho."
              : "Network error: Failed to load stream. Please check your connection.";

            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError(customErrorMessage);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error: The stream format is unsupported or corrupted.");
                break;
              default:
                setError("A fatal error occurred during playback.");
                break;
            }
            if (hls) hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) video.play().catch(() => setIsPlaying(false));
        });
        video.addEventListener('error', () => {
          if (!useProxy) {
            console.log('Native video playback error. Retrying via backend CORS proxy...');
            setUseProxy(true);
          } else {
            const isRestrictedChannel = channelName && (
              channelName.toLowerCase().includes('bbc') || 
              channelName.toLowerCase().includes('fox') || 
              channelName.toLowerCase().includes('bein')
            );
            setError(isRestrictedChannel 
              ? "This stream is currently offline or restricted in your region. Please try alternative active streams like ITV Deportes or TSN The Ocho."
              : "Native playback error: Failed to load stream."
            );
          }
        });
      }
    };

    setupHls();

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    const onEnterPiP = () => onPiPChange?.(true);
    const onLeavePiP = () => onPiPChange?.(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('enterpictureinpicture', onEnterPiP);
    video.addEventListener('leavepictureinpicture', onLeavePiP);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('enterpictureinpicture', onEnterPiP);
      video.removeEventListener('leavepictureinpicture', onLeavePiP);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [url, autoPlay, onPiPChange, useProxy]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="group relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />

      {/* Buffering State */}
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] z-10">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl z-50 p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Stream Unavailable</h3>
          <p className="text-white/60 max-w-md mb-6">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRetry();
              }}
              className="relative z-[60] px-8 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 cursor-pointer pointer-events-auto"
            >
              Retry Connection
            </button>
            {onBack && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBack();
                }}
                className="relative z-[60] px-8 py-3 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all active:scale-95 cursor-pointer pointer-events-auto border border-white/10"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className={`absolute inset-0 z-30 flex flex-col justify-between transition-opacity duration-500 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'} ${error ? 'pointer-events-none' : ''}`}>
        {/* Top Bar - Channel Info & Back Button */}
        <div className="p-8 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
          <div className="flex items-start space-x-6">
            {onBack && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className="p-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 hover:bg-white/20 transition-all group/back"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover/back:-translate-x-1 transition-transform" />
              </button>
            )}
            
            <div className="flex flex-col">
              {channelName && (
                <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-2xl">
                  {channelName}
                </h2>
              )}
              {groupTitle && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                  <p className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">
                    Live • {groupTitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar - Controls */}
        <div className="p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Play/Pause */}
              <button 
                onClick={togglePlay}
                className="text-white hover:text-blue-400 transition-colors transform active:scale-90"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
              </button>

              {/* Volume */}
              <div className="flex items-center space-x-3 group/volume">
                <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 group-hover/volume:w-32 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              {/* Picture-in-Picture */}
              {document.pictureInPictureEnabled && (
                <button onClick={togglePiP} className="text-white hover:text-blue-400 transition-colors">
                  <ExternalLink className="w-6 h-6" />
                </button>
              )}

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="text-white hover:text-blue-400 transition-colors">
                {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
