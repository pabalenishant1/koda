import { useState, useCallback } from 'react';

interface LinkMetadata {
  title: string;
  description: string;
  image: string | null;
  favicon: string;
}

export function useLinkMetadata() {
  const [loading, setLoading] = useState(false);

  const fetchMetadata = useCallback(async (url: string): Promise<LinkMetadata> => {
    setLoading(true);
    try {
      // Use microlink.io API for metadata extraction
      const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (data.status === 'success' && data.data) {
        const { title, description, image, logo } = data.data;
        return {
          title: title || new URL(url).hostname,
          description: description || '',
          image: image?.url || null,
          favicon: logo?.url || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`,
        };
      }
      
      // Fallback
      const domain = new URL(url).hostname.replace('www.', '');
      return {
        title: domain,
        description: '',
        image: null,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
    } catch {
      const domain = new URL(url).hostname.replace('www.', '');
      return {
        title: domain,
        description: '',
        image: null,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const parseVideoUrl = useCallback((url: string): { isVideo: boolean; videoType: 'youtube' | 'vimeo' | null; videoId: string | null } => {
    // YouTube
    const youtubeMatch = url.match(
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
    );
    if (youtubeMatch) {
      return { isVideo: true, videoType: 'youtube', videoId: youtubeMatch[1] };
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return { isVideo: true, videoType: 'vimeo', videoId: vimeoMatch[1] };
    }
    
    return { isVideo: false, videoType: null, videoId: null };
  }, []);

  return { fetchMetadata, parseVideoUrl, loading };
}
