'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicGallery } from '@/lib/api/media';
import { formatMediaUrl } from '@/lib/utils';

/**
 * Renders the first homepage banner image (first `hero_slide` gallery item)
 * as an absolute background with a dark overlay. Place inside a
 * `relative overflow-hidden` hero section; content must sit at `relative z-10`.
 * Falls back to the section's own background colour if no slide exists.
 */
export function HeroBackground() {
  const { data } = useQuery({
    queryKey: ['public-gallery-home'],
    queryFn: () => fetchPublicGallery({ limit: 50 }),
    staleTime: 5 * 60 * 1000,
  });

  const firstSlide = (data?.items || []).find((i) => i.category === 'hero_slide');
  const imgUrl = firstSlide ? formatMediaUrl(firstSlide.url) : null;
  if (!imgUrl) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${imgUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/50" />
    </div>
  );
}
