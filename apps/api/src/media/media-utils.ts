export interface VideoEmbedDetails {
  platform: 'YOUTUBE' | 'FACEBOOK' | 'OTHER';
  embedId: string;
  embedUrl: string;
}

export function parseVideoUrl(inputUrlOrId: string): VideoEmbedDetails {
  const clean = inputUrlOrId.trim();

  // Check YouTube patterns
  const ytMatch =
    clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|shorts\/))([\w-]{11})/) ||
    clean.match(/^([\w-]{11})$/);

  if (ytMatch && ytMatch[1]) {
    const embedId = ytMatch[1];
    return {
      platform: 'YOUTUBE',
      embedId,
      embedUrl: `https://www.youtube.com/embed/${embedId}`,
    };
  }

  // Check Facebook patterns
  if (clean.includes('facebook.com') || clean.includes('fb.watch')) {
    const encodedUrl = encodeURIComponent(clean);
    return {
      platform: 'FACEBOOK',
      embedId: clean,
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false`,
    };
  }

  // Default fallback
  return {
    platform: 'OTHER',
    embedId: clean,
    embedUrl: clean,
  };
}
