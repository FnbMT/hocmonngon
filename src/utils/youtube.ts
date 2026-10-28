/**
 * Utility to extract YouTube Video ID and format embed URLs cleanly
 * Supports:
 * - https://youtu.be/<id> (standard share link for unlisted/public videos)
 * - https://www.youtube.com/watch?v=<id>
 * - https://m.youtube.com/watch?v=<id>
 * - https://www.youtube.com/embed/<id>
 * - https://www.youtube.com/shorts/<id>
 * - https://www.youtube.com/live/<id>
 * - iframe html snippet containing youtube src
 */

export const DEFAULT_YOUTUBE_ID = 'Pj13k8Lq0jQ';

export function extractYouTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // If user pasted an iframe embed code, extract src
  if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return extractYouTubeId(match[1]);
    }
  }

  // If it's already just an 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // youtu.be/<id>
  const youtuBeMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuBeMatch && youtuBeMatch[1]) {
    return youtuBeMatch[1];
  }

  // youtube.com/embed/<id>
  const embedMatch = trimmed.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/i);
  if (embedMatch && embedMatch[1]) {
    return embedMatch[1];
  }

  // youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return shortsMatch[1];
  }

  // youtube.com/live/<id>
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/i);
  if (liveMatch && liveMatch[1]) {
    return liveMatch[1];
  }

  // youtube.com/watch?v=<id> or with other params
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }

  // youtube.com/v/<id>
  const vMatch = trimmed.match(/youtube\.com\/v\/([a-zA-Z0-9_-]{11})/i);
  if (vMatch && vMatch[1]) {
    return vMatch[1];
  }

  return null;
}

/**
 * Returns a fully qualified YouTube embed URL.
 * Automatically adds rel=0, playsinline=1, modestbranding=1, and optional autoplay.
 */
export function toYouTubeEmbedUrl(url?: string, options: { autoplay?: boolean } = { autoplay: true }): string {
  const videoId = extractYouTubeId(url) || DEFAULT_YOUTUBE_ID;
  const autoplayParam = options.autoplay ? '1' : '0';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&rel=0&playsinline=1&modestbranding=1&enablejsapi=1`;
}
