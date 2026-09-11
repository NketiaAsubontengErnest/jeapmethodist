'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fetchPublicGallery, type MediaItem } from '@/lib/api/media';
import { fetchAlbumById } from '@/lib/api/albums';
import { Folder, Image as ImageIcon, Loader2, Play, Radio, Tv, X, ArrowLeft, Sparkles, ExternalLink } from 'lucide-react';

function getThumbnailUrl(item: MediaItem): string | null {
  const url = item.externalUrl || item.url || '';
  const clean = url.trim();

  if (item.embedId && (item.platform === 'YOUTUBE' || !item.platform || clean.includes('youtube'))) {
    return `https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg`;
  }

  const match =
    clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|shorts\/))([\w-]{11})/) ||
    clean.match(/^([\w-]{11})$/);

  if (match?.[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }

  return null;
}

function getDirectWatchUrl(item: MediaItem): string {
  if (item.externalUrl) return item.externalUrl;
  if (item.embedId) return `https://www.youtube.com/watch?v=${item.embedId}`;
  return item.url;
}

function getEmbedUrl(item: MediaItem): string {
  const url = item.externalUrl || item.url || '';
  const clean = url.trim();

  if (item.embedId && (item.platform === 'YOUTUBE' || !item.platform || clean.includes('youtube'))) {
    return `https://www.youtube.com/embed/${item.embedId}`;
  }

  const match =
    clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|shorts\/))([\w-]{11})/) ||
    clean.match(/^([\w-]{11})$/);

  if (match?.[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  if (clean.includes('facebook.com') || clean.includes('fb.watch')) {
    const encoded = encodeURIComponent(clean);
    return `https://www.facebook.com/plugins/video.php?href=${encoded}&show_text=false`;
  }

  return clean;
}

function isMediaVideo(item: MediaItem): boolean {
  return (
    item.type === 'LIVE_VIDEO' ||
    item.type === 'VIDEO' ||
    item.mimeType === 'video/embed' ||
    Boolean(item.embedId) ||
    Boolean(item.externalUrl) ||
    Boolean(getThumbnailUrl(item)) ||
    Boolean(item.url && (item.url.includes('youtu') || item.url.includes('youtube') || item.url.includes('facebook') || item.url.includes('embed'))) ||
    Boolean(item.storedName && item.storedName.startsWith('embed_'))
  );
}

export default function GalleryClient() {
  const [filterType, setFilterType] = useState<'ALL' | 'ALBUMS' | 'LIVE' | 'VIDEOS'>('ALL');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['public-gallery'],
    queryFn: () => fetchPublicGallery({ limit: 100 }),
  });

  const albumDetailQuery = useQuery({
    queryKey: ['public-album-detail', selectedAlbumId],
    queryFn: () => fetchAlbumById(selectedAlbumId!),
    enabled: Boolean(selectedAlbumId),
  });

  const items = (data?.items || []).filter(
    (i) => i.category !== 'identity' && i.title !== 'logo_url' && i.title !== 'favicon_url'
  );
  const albums = data?.albums || [];

  const liveVideos = items.filter((i) => i.type === 'LIVE_VIDEO');
  const recordedVideos = items.filter(
    (i) => i.type === 'VIDEO' || (i.type as string) !== 'LIVE_VIDEO' && (i.mimeType === 'video/embed' || Boolean(i.embedId) || isMediaVideo(i))
  );
  const photos = items.filter(
    (i) => i.type === 'PHOTO' && !isMediaVideo(i)
  );

  return (
    <div className="space-y-12">
      {/* Hero Banner Header — Royal Blue & Gold Aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14309c] p-10 text-white shadow-2xl border border-blue-800 text-center max-w-4xl mx-auto">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -mt-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative z-10 space-y-4">
          <Badge className="bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold uppercase text-[11px] tracking-widest px-3 py-1">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Visual Storytelling &amp; Live Streams
          </Badge>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Church Photo Gallery &amp; Live Streams
          </h1>
          <p className="text-base text-slate-300 max-w-2xl mx-auto">
            Browse our photo albums, relive past services and choir ministrations, and watch live broadcasts on YouTube &amp; Facebook.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <Tabs value={filterType} onValueChange={(v: string) => setFilterType(v as typeof filterType)}>
          <TabsList className="grid grid-cols-4 sm:w-auto bg-[#14309c] text-slate-300 p-1.5 rounded-xl shadow-lg">
            <TabsTrigger value="ALL" className="text-xs sm:text-sm data-[state=active]:bg-[#FFC72C] data-[state=active]:text-[#14309c] font-bold">
              All Content
            </TabsTrigger>
            <TabsTrigger value="ALBUMS" className="text-xs sm:text-sm flex items-center gap-1.5 data-[state=active]:bg-[#FFC72C] data-[state=active]:text-[#14309c] font-bold">
              <Folder className="h-3.5 w-3.5" /> Photo Albums ({albums.length})
            </TabsTrigger>
            <TabsTrigger value="LIVE" className="text-xs sm:text-sm flex items-center gap-1.5 data-[state=active]:bg-[#FFC72C] data-[state=active]:text-[#14309c] font-bold">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Streams
            </TabsTrigger>
            <TabsTrigger value="VIDEOS" className="text-xs sm:text-sm flex items-center gap-1.5 data-[state=active]:bg-[#FFC72C] data-[state=active]:text-[#14309c] font-bold">
              <Tv className="h-3.5 w-3.5" /> Videos
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Selected Album Lightbox View */}
      {selectedAlbumId && albumDetailQuery.data && (
        <div className="space-y-6 rounded-3xl border border-[#14309c]/20 bg-[#14309c]/5 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#14309c]/10 pb-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-[#14309c] text-[#14309c] hover:bg-[#14309c] hover:text-white font-bold" onClick={() => setSelectedAlbumId(null)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Albums
              </Button>
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#14309c]">{albumDetailQuery.data.title}</h2>
                <p className="text-xs text-slate-600">
                  {albumDetailQuery.data.description || 'Photo collection'} •{' '}
                  <span className="font-bold text-amber-600">
                    {albumDetailQuery.data.photos?.length || 0} pictures in album
                  </span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAlbumId(null)}>
              <X className="h-4 w-4" /> Close
            </Button>
          </div>

          {albumDetailQuery.data.photos?.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
              This album is currently empty.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {albumDetailQuery.data.photos?.map((photo) => (
                <Card
                  key={photo.id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setActiveMedia(photo as unknown as MediaItem)}
                >
                  <div className="aspect-4/3 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  {photo.title && (
                    <div className="p-3">
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{photo.title}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center text-slate-500">
          <Loader2 className="mr-2 h-6 w-6 animate-spin text-amber-500" /> Loading church media gallery…
        </div>
      ) : (
        <div className="space-y-12">
          {/* Section 1: Photo Albums Section */}
          {(filterType === 'ALL' || filterType === 'ALBUMS') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="font-serif text-2xl font-extrabold text-[#14309c] flex items-center gap-2">
                  <Folder className="h-5 w-5 text-amber-500" /> Photo Albums
                </h2>
                <span className="text-xs font-semibold text-slate-500">Click an album card to open all photos</span>
              </div>

              {albums.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                  No photo albums published yet. Photo albums created from the admin dashboard will appear here.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {albums.map((album) => {
                    const cover = album.photos?.[0]?.url || album.coverUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80';
                    return (
                      <Card
                        key={album.id}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                        onClick={() => setSelectedAlbumId(album.id)}
                      >
                        <div className="relative aspect-16/10 overflow-hidden bg-slate-950">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cover}
                            alt={album.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-5 flex flex-col justify-end text-white">
                            <Badge className="w-fit bg-[#14309c] border border-amber-500/50 text-amber-400 font-mono text-[11px] font-bold mb-1.5">
                              {album._count?.photos ?? 0} PHOTOS
                            </Badge>
                            <h3 className="font-serif text-xl font-bold leading-tight line-clamp-1">{album.title}</h3>
                            {album.description && (
                              <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{album.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white">
                          <span className="text-xs text-slate-500 font-medium">
                            Photo Collection
                          </span>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-600 font-bold hover:text-amber-700">
                            View Pictures →
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Live Streams & Videos Section */}
          {(filterType === 'ALL' || filterType === 'LIVE' || filterType === 'VIDEOS') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="font-serif text-2xl font-extrabold text-[#14309c] flex items-center gap-2">
                  <Radio className="h-5 w-5 text-rose-500 animate-pulse" /> Live Worship &amp; Videos
                </h2>
                <span className="text-xs font-semibold text-slate-500">Watch live YouTube &amp; Facebook broadcasts</span>
              </div>

              {liveVideos.length === 0 && recordedVideos.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                  No video streams currently posted. Live worship links will appear here when posted.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[...liveVideos, ...recordedVideos].map((video) => {
                    const ytThumb = getThumbnailUrl(video);

                    return (
                      <Card
                        key={video.id}
                        className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer text-slate-900"
                        onClick={() => setActiveMedia(video)}
                      >
                        <div className="relative aspect-16/9 overflow-hidden bg-slate-950 flex items-center justify-center">
                          {ytThumb ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={ytThumb} alt={video.title || video.filename} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          ) : null}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="rounded-full bg-amber-500 p-4 text-slate-950 shadow-2xl transition-transform group-hover:scale-110">
                              <Play className="h-8 w-8 fill-current ml-0.5" />
                            </div>
                          </div>
                          <Badge className="absolute top-3 left-3 bg-[#14309c] text-amber-400 font-mono text-[10px] font-bold uppercase border border-amber-500/30">
                            {video.type === 'LIVE_VIDEO' ? 'LIVE STREAM' : 'VIDEO'}
                          </Badge>
                          {video.platform && (
                            <Badge variant="outline" className="absolute top-3 right-3 bg-black/70 text-white border-white/20 text-[10px]">
                              {video.platform}
                            </Badge>
                          )}
                        </div>
                        <div className="p-4 space-y-1.5 bg-white">
                          <h3 className="font-serif text-base font-bold text-slate-900 line-clamp-1">
                            {video.title || video.filename}
                          </h3>
                          {video.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{video.description}</p>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 3: General Photo Gallery Grid */}
          {(filterType === 'ALL') && photos.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="font-serif text-2xl font-extrabold text-[#14309c] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-amber-500" /> Recent Photos
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {photos.map((item) => (
                  <Card
                    key={item.id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    onClick={() => setActiveMedia(item)}
                  >
                    <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.title || item.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4 space-y-1.5 bg-white">
                      <Badge className="w-fit bg-[#14309c] text-amber-400 font-bold text-xs border border-amber-500/30">
                        {item.category || 'Church Life'}
                      </Badge>
                      <h3 className="font-serif text-base font-bold text-slate-900 leading-snug line-clamp-2">
                        {item.title || item.filename}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Callout Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14309c] to-[#1c37ae] p-8 text-white shadow-2xl flex flex-wrap items-center justify-between gap-6 border border-blue-800">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold">Visit us this week</h3>
              <p className="text-sm text-slate-200">We would love to meet you and your family. Join our Sunday Divine Worship service.</p>
            </div>
            <a href="/visit-us">
              <Button className="bg-[#FFC72C] text-[#14309c] font-extrabold hover:bg-amber-400 transition-all shadow-xl px-6 py-2">
                Get in Touch
              </Button>
            </a>
          </div>
        </div>
      )}

      {/* Video & Live Stream Viewer Dialog */}
      {activeMedia && (
        <Dialog open={Boolean(activeMedia)} onOpenChange={() => setActiveMedia(null)}>
          <DialogContent className="sm:max-w-3xl bg-[#14309c] border border-blue-800 text-white p-6 shadow-2xl rounded-2xl">
            <DialogHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3 pr-6">
                <DialogTitle className="flex items-center gap-2 text-white font-serif text-xl">
                  <Badge className="bg-[#FFC72C] text-[#14309c] font-bold">
                    {(activeMedia.mimeType === 'video/embed' ? 'VIDEO' : activeMedia.type).replace('_', ' ')}
                  </Badge>
                  {activeMedia.title || activeMedia.filename}
                </DialogTitle>

                {isMediaVideo(activeMedia) && (
                  <a
                    href={getDirectWatchUrl(activeMedia)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFC72C] px-3.5 py-1.5 text-xs font-extrabold text-[#14309c] shadow hover:bg-amber-400 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Watch on {activeMedia.platform || 'YouTube'}
                  </a>
                )}
              </div>
              {activeMedia.description && <DialogDescription className="text-slate-200 text-sm">{activeMedia.description}</DialogDescription>}
            </DialogHeader>

            {isMediaVideo(activeMedia) ? (
              <div className="aspect-16/9 w-full overflow-hidden rounded-xl bg-black shadow-2xl border border-blue-900/60 mt-3">
                <iframe
                  src={getEmbedUrl(activeMedia)}
                  title={activeMedia.title || 'Video Player'}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="max-h-[70vh] overflow-hidden rounded-xl bg-black mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMedia.url}
                  alt={activeMedia.title || activeMedia.filename}
                  className="max-h-[70vh] w-full object-contain mx-auto"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
