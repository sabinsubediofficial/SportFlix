import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { Channel } from '../services/api';

interface PlayerContextType {
  selectedChannel: Channel | null;
  setSelectedChannel: (channel: Channel | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  openPlayer: (channel: Channel) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openPlayer = (channel: Channel) => {
    setSelectedChannel(channel);
    setIsModalOpen(true);
  };

  const closePlayer = () => {
    setIsModalOpen(false);
    // We don't null selectedChannel here to allow PiP to continue
    if (!document.pictureInPictureElement) {
      setSelectedChannel(null);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      selectedChannel, 
      setSelectedChannel, 
      isModalOpen, 
      setIsModalOpen,
      openPlayer,
      closePlayer
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
