import axios from 'axios';
import parser from 'iptv-playlist-parser';

export const parseM3UFromUrl = async (url: string) => {
  try {
    const response = await axios.get(url);
    const result = parser.parse(response.data);
    return result.items.map(item => ({
      name: item.name,
      logo: item.tvg.logo,
      groupTitle: item.group.title,
      streamUrl: item.url,
      tvgId: item.tvg.id,
    }));
  } catch (error) {
    console.error('Error parsing M3U:', error);
    throw error;
  }
};
