import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface Program {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  groupTitle?: string;
  streamUrl: string;
  status?: string;
  popularity?: number;
  programs?: Program[];
}
// ... rest of file

export const fetchChannels = async (query?: string): Promise<Channel[]> => {
  const url = (typeof query === 'string' && query.trim()) 
    ? `${API_BASE_URL}/channels?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/channels`;
  const response = await axios.get(url);
  return response.data;
};

export const searchIptvOrg = async (query: string): Promise<Channel[]> => {
  const response = await axios.get(`${API_BASE_URL}/channels/iptv-org/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const validateChannelById = async (id: string) => {
  const response = await axios.post(`${API_BASE_URL}/channels/validate/${id}`);
  return response.data;
};

export const importChannels = async (options: { url?: string, name?: string, useApi?: boolean, query?: string, limit?: number }) => {
  const response = await axios.post(`${API_BASE_URL}/channels/import`, options);
  return response.data;
};
