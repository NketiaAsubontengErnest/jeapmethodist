'use client';

import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  FolderPlus,
  Image as ImageIcon,
  Loader2,
  Plus,
  Radio,
  Trash2,
  Upload,
  Video,
  Eye,
  ArrowLeft,
  Tv,
  ExternalLink,
  Pencil,
} from 'lucide-react';
import {
  fetchMediaAdmin,
  uploadMedia,
  createVideoPost,
  updateMedia,
  deleteMedia,
  type MediaItem,
  type MediaType,
} from '@/lib/api/media';
import {
  fetchAlbums,
  createAlbum,
  deleteAlbum,
  fetchAlbumById,
  type AlbumItem,
} from '@/lib/api/albums';
import { ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetBody,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatSize(bytes: number) {
  if (bytes === 0) return 'Embedded';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaThumbnail({ item }: { item: MediaItem }) {
  const isVideo =
    item.type === 'LIVE_VIDEO' ||
    item.type === 'VIDEO' ||
    item.mimeType === 'video/embed' ||
    Boolean(item.embedId);

  if (isVideo) {
    const ytThumb =
      item.embedId && (item.platform === 'YOUTUBE' || !item.platform)
        ? `https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg`
        : null;

    if (ytThumb) {
      return (
        <div className="relative h-full w-full overflow-hidden bg-slate-950">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ytThumb} alt={item.title || item.filename} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="rounded-full bg-rose-600 p-2.5 text-white shadow-lg">
              <Tv className="h-5 w-5" />
            </div>
          </div>
          <Badge className="absolute bottom-2 left-2 bg-rose-600 font-mono text-[10px] text-white">
            {item.type === 'LIVE_VIDEO' ? 'LIVE STREAM' : 'VIDEO'}
          </Badge>
        </div>
      );
    }

    return (
      <div className="relative flex h-full w-full items-center justify-center bg-slate-950 text-white">
        <Tv className="h-10 w-10 text-rose-500 animate-pulse" />
        <Badge className="absolute bottom-2 left-2 bg-rose-600 font-mono text-[10px] text-white">
          {item.type === 'LIVE_VIDEO' ? 'LIVE STREAM' : 'VIDEO'}
        </Badge>
      </div>
    );
  }
  if (item.mimeType?.startsWith('image/') || (item.url && !item.url.includes('youtube.com/embed'))) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.url} alt={item.filename} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
    );
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary text-muted-foreground">
      <FileText className="h-10 w-10" />
    </div>
  );
}

export default function MediaPage() {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'albums' | 'photos' | 'videos' | 'live'>('videos');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Upload/Post Modal State
  const [postOpen, setPostOpen] = useState(false);
  const [postType, setPostType] = useState<MediaType>('PHOTO');
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [postAlbumId, setPostAlbumId] = useState<string>('none');
  const [videoUrlOrId, setVideoUrlOrId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Media Modal State
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editAlbumId, setEditAlbumId] = useState<string>('none');

  // Create Album Modal State
  const [albumOpen, setAlbumOpen] = useState(false);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumCoverUrl, setAlbumCoverUrl] = useState('');

  // Active Video Embed Preview Modal
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  const canView = hasPermission('media.view');
  const canUpload = hasPermission('media.upload');
  const canDelete = hasPermission('media.delete');

  // Queries
  const albumsQuery = useQuery({
    queryKey: ['albums-admin'],
    queryFn: () => fetchAlbums({ pageSize: 50 }),
    enabled: canView,
  });

  const mediaQuery = useQuery({
    queryKey: ['media-admin', activeTab, selectedAlbumId],
    queryFn: () =>
      fetchMediaAdmin({
        pageSize: 50,
        type:
          activeTab === 'photos'
            ? 'PHOTO'
            : activeTab === 'videos'
            ? 'VIDEO'
            : activeTab === 'live'
            ? 'LIVE_VIDEO'
            : undefined,
        albumId: selectedAlbumId || undefined,
      }),
    enabled: canView && activeTab !== 'albums',
  });

  const mediaItems = (mediaQuery.data?.items || []).filter(
    (i) => i.category !== 'identity' && i.title !== 'logo_url' && i.title !== 'favicon_url'
  );

  const selectedAlbumQuery = useQuery({
    queryKey: ['album-detail', selectedAlbumId],
    queryFn: () => fetchAlbumById(selectedAlbumId!),
    enabled: Boolean(selectedAlbumId),
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (postType === 'PHOTO') {
        if (!selectedFile) throw new Error('Please choose an image file to upload.');
        return uploadMedia(selectedFile, {
          title: postTitle || undefined,
          description: postDescription || undefined,
          category: postCategory || undefined,
          albumId: postAlbumId !== 'none' ? postAlbumId : undefined,
        });
      } else {
        if (!videoUrlOrId.trim()) throw new Error('Please provide a YouTube or Facebook link or video ID.');
        return createVideoPost({
          title: postTitle || (postType === 'LIVE_VIDEO' ? 'Live Worship Stream' : 'Church Video'),
          description: postDescription || undefined,
          type: postType,
          videoUrlOrId: videoUrlOrId.trim(),
          category: postCategory || undefined,
        });
      }
    },
    onSuccess: (media) => {
      setPostOpen(false);
      resetPostForm();

      queryClient.invalidateQueries({ queryKey: ['media-admin'] });
      queryClient.invalidateQueries({ queryKey: ['albums-admin'] });
      queryClient.invalidateQueries({ queryKey: ['album-detail'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });

      const mediaType = media?.type || 'VIDEO';
      const isVideo =
        mediaType === 'VIDEO' ||
        mediaType === 'LIVE_VIDEO' ||
        media?.mimeType === 'video/embed' ||
        Boolean(media?.embedId);

      if (isVideo) {
        if (mediaType === 'LIVE_VIDEO') {
          setActiveTab('live');
        } else {
          setActiveTab('videos');
        }
        setSelectedAlbumId(null);
      } else if (mediaType === 'PHOTO' && (!postAlbumId || postAlbumId === 'none')) {
        setActiveTab('photos');
        setSelectedAlbumId(null);
      }

      toast.success(
        mediaType === 'LIVE_VIDEO'
          ? 'Live stream published!'
          : mediaType === 'VIDEO'
          ? 'Video published!'
          : 'Photo uploaded!',
      );
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : (e as Error).message || 'Failed to publish post';
      setError(message);
      toast.error('Failed to publish', message);
    },
  });

  const updateMediaMutation = useMutation({
    mutationFn: async () => {
      if (!editingMedia) return;
      return updateMedia(editingMedia.id, {
        title: editTitle.trim() || undefined,
        description: editDescription.trim() || undefined,
        albumId: editAlbumId !== 'none' ? editAlbumId : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-admin'] });
      queryClient.invalidateQueries({ queryKey: ['albums-admin'] });
      queryClient.invalidateQueries({ queryKey: ['album-detail'] });
      setEditingMedia(null);
      toast.success('Media updated!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : (e as Error).message || 'Failed to update media';
      setError(message);
      toast.error('Failed to update media', message);
    },
  });

  const albumMutation = useMutation({
    mutationFn: () => {
      if (!albumTitle.trim()) throw new Error('Album title is required');
      return createAlbum({
        title: albumTitle.trim(),
        description: albumDescription.trim() || undefined,
        coverUrl: albumCoverUrl.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums-admin'] });
      setAlbumOpen(false);
      setAlbumTitle('');
      setAlbumDescription('');
      setAlbumCoverUrl('');
      toast.success('Album created!');
    },
    onError: (e) => {
      const message = e instanceof ApiError ? e.message : (e as Error).message || 'Failed to create album';
      setError(message);
      toast.error('Failed to create album', message);
    },
  });

  const deleteMediaMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-admin'] });
      queryClient.invalidateQueries({ queryKey: ['albums-admin'] });
      queryClient.invalidateQueries({ queryKey: ['album-detail'] });
      toast.success('Media deleted');
    },
    onError: (e) => toast.error('Failed to delete media', e instanceof ApiError ? e.message : undefined),
  });

  const deleteAlbumMutation = useMutation({
    mutationFn: deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums-admin'] });
      setSelectedAlbumId(null);
      toast.success('Album deleted');
    },
    onError: (e) => toast.error('Failed to delete album', e instanceof ApiError ? e.message : undefined),
  });

  function resetPostForm() {
    setPostTitle('');
    setPostDescription('');
    setPostCategory('');
    setPostAlbumId('none');
    setVideoUrlOrId('');
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const openPostModal = (type: MediaType = 'PHOTO', albumIdTarget?: string) => {
    resetPostForm();
    setPostType(type);
    if (albumIdTarget) setPostAlbumId(albumIdTarget);
    setPostOpen(true);
  };

  const openEditModal = (item: MediaItem) => {
    setEditingMedia(item);
    setEditTitle(item.title || '');
    setEditDescription(item.description || '');
    setEditAlbumId(item.albumId || 'none');
    setError(null);
  };

  if (!canView) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          You don&apos;t have permission to access the Media Library.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Media &amp; Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Manage Photo Albums, upload pictures, publish video recordings, and link YouTube / Facebook Live streams.
          </p>
        </div>
        {canUpload && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setAlbumOpen(true)}>
              <FolderPlus className="mr-1.5 h-4 w-4 text-amber-500" /> Create Album
            </Button>
            <Button onClick={() => openPostModal('PHOTO')}>
              <Plus className="mr-1.5 h-4 w-4" /> Post Media / Photo / Video
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs
        value={selectedAlbumId ? 'album-view' : activeTab}
        onValueChange={(val: string) => {
          setSelectedAlbumId(null);
          if (val !== 'album-view') setActiveTab(val as typeof activeTab);
        }}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="h-4 w-4 text-purple-500" /> Videos
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-rose-500 animate-pulse" /> Live Streams
          </TabsTrigger>
          <TabsTrigger value="photos" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-blue-500" /> All Photos
          </TabsTrigger>
          <TabsTrigger value="albums" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-amber-500" /> Photo Albums ({albumsQuery.data?.total ?? 0})
          </TabsTrigger>
        </TabsList>

        {/* Selected Album View Header (If viewing specific album) */}
        {selectedAlbumId && selectedAlbumQuery.data && (
          <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedAlbumId(null)}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to Albums
              </Button>
              <div>
                <h2 className="font-serif text-xl font-bold">{selectedAlbumQuery.data.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedAlbumQuery.data.description || 'No description provided'} •{' '}
                  <span className="font-semibold text-foreground">
                    {selectedAlbumQuery.data.photos?.length || 0} pictures in album
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => openPostModal('PHOTO', selectedAlbumId)}>
                <Upload className="mr-1.5 h-4 w-4" /> Add Photos to this Album
              </Button>
              {canDelete && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteAlbumMutation.mutate(selectedAlbumId)}
                  disabled={deleteAlbumMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" /> Delete Album
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tab 1: Photo Albums */}
        <TabsContent value="albums" className="space-y-6">
          {albumsQuery.isLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> Loading Photo Albums…
            </div>
          ) : albumsQuery.data && albumsQuery.data.items.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                <div className="rounded-full bg-amber-50 p-4 text-amber-600 admin-dark:bg-amber-950">
                  <FolderPlus className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">No Photo Albums Created Yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Create an album (e.g. &quot;Sunday Worship Services&quot;, &quot;Youth Camp 2026&quot;) to group pictures.
                  </p>
                </div>
                <Button onClick={() => setAlbumOpen(true)}>
                  <Plus className="mr-1.5 h-4 w-4" /> Create First Album
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albumsQuery.data?.items.map((album) => {
                const coverPhoto = album.photos?.[0]?.url || album.coverUrl || 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80';
                return (
                  <Card
                    key={album.id}
                    className="group overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                    onClick={() => setSelectedAlbumId(album.id)}
                  >
                    <div className="relative aspect-16/10 overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverPhoto}
                        alt={album.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                        <Badge className="w-fit bg-amber-500/90 text-white font-mono text-[11px] mb-1">
                          {album._count?.photos ?? 0} PHOTOS
                        </Badge>
                        <h3 className="font-serif text-lg font-bold leading-tight line-clamp-1">{album.title}</h3>
                        {album.description && (
                          <p className="text-xs text-slate-200 line-clamp-1">{album.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-card">
                      <span className="text-xs text-muted-foreground">
                        Created {new Date(album.createdAt).toLocaleDateString()}
                      </span>
                      <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">
                        View Album Photos <Eye className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2 & 3 & 4 & Album-Detail Grid */}
        <TabsContent value={selectedAlbumId ? 'album-view' : (activeTab === 'albums' ? 'albums-media-none' : activeTab)} className="space-y-6">
          {selectedAlbumId && selectedAlbumQuery.data ? (
            /* Album Photos Display */
            <div className="space-y-4">
              {(!selectedAlbumQuery.data.photos || selectedAlbumQuery.data.photos.length === 0) ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    This album is currently empty. Click &quot;Add Photos to this Album&quot; to upload pictures.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {selectedAlbumQuery.data.photos?.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-xl border bg-card">
                      <div className="aspect-square overflow-hidden bg-muted">
                        <MediaThumbnail item={item as unknown as MediaItem} />
                      </div>
                      <div className="space-y-1 p-3">
                        <p className="truncate text-xs font-semibold" title={item.title || item.filename}>
                          {item.title || item.filename}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{formatSize(item.size)}</span>
                          <div className="flex items-center gap-1">
                            {canUpload && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(item as unknown as MediaItem);
                                }}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMediaMutation.mutate(item.id);
                                }}
                                disabled={deleteMediaMutation.isPending}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* General Media Items Grid */
            <>
              {mediaQuery.isLoading ? (
                <div className="flex items-center justify-center py-16 text-muted-foreground">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> Loading media items…
                </div>
              ) : mediaItems.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-sm text-muted-foreground">
                    No items found for this view. Click &quot;Post Media / Photo / Video&quot; to publish new content.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all hover:border-primary"
                    >
                      <div
                        className="relative aspect-16/10 cursor-pointer overflow-hidden bg-muted"
                        onClick={() => {
                          const isVideo =
                            item.type === 'LIVE_VIDEO' ||
                            item.type === 'VIDEO' ||
                            item.mimeType === 'video/embed' ||
                            Boolean(item.embedId);
                          if (isVideo) {
                            setPreviewMedia(item);
                          }
                        }}
                      >
                        <MediaThumbnail item={item} />
                        {(item.type === 'LIVE_VIDEO' || item.type === 'VIDEO' || item.mimeType === 'video/embed' || Boolean(item.embedId)) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-90 transition-opacity group-hover:bg-black/60">
                            <div className="rounded-full bg-rose-600 p-3 text-white shadow-lg">
                              <Tv className="h-6 w-6" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 p-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {(item.mimeType === 'video/embed' ? 'VIDEO' : item.type).replace('_', ' ')}
                          </Badge>
                          {item.album && (
                            <Badge variant="secondary" className="text-[10px]">
                              {item.album.title}
                            </Badge>
                          )}
                        </div>
                        <p className="truncate text-xs font-bold text-foreground" title={item.title || item.filename}>
                          {item.title || item.filename}
                        </p>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                          <span>{formatSize(item.size)}</span>
                          <div className="flex items-center gap-1">
                            {item.externalUrl && (
                              <a
                                href={item.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 hover:text-primary"
                                title="Open original link"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {canUpload && (
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                                title="Edit Details"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => deleteMediaMutation.mutate(item.id)}
                                disabled={deleteMediaMutation.isPending}
                                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label="Delete"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Edit Media Modal */}
      {editingMedia && (
        <Dialog open={Boolean(editingMedia)} onOpenChange={(open: boolean) => !open && setEditingMedia(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Media Details</DialogTitle>
              <DialogDescription>Update title, description or assigned album.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Media title..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDesc">Description</Label>
                <Textarea
                  id="editDesc"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Description or context..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAlbum">Assign to Album</Label>
                <Select value={editAlbumId} onValueChange={setEditAlbumId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose album..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Album (General Media)</SelectItem>
                    {albumsQuery.data?.items.map((album) => (
                      <SelectItem key={album.id} value={album.id}>
                        {album.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMedia(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setError(null);
                  updateMediaMutation.mutate();
                }}
                disabled={updateMediaMutation.isPending}
              >
                {updateMediaMutation.isPending ? 'Updating…' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Sheet: Post Media / Photo / Video / Live Stream Modal */}
      <Sheet open={postOpen} onOpenChange={setPostOpen}>
        <SheetContent className="sm:max-w-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              uploadMutation.mutate();
            }}
            className="flex h-full flex-col space-y-4"
          >
            <SheetHeader>
              <SheetTitle>Post Media or Live Video</SheetTitle>
              <SheetDescription>
                Upload photos to albums, publish videos, or paste YouTube/Facebook Live Video links.
              </SheetDescription>
            </SheetHeader>

            <SheetBody className="space-y-4">
              {/* Type Selection */}
              <div className="space-y-2">
                <Label>Content Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={postType === 'PHOTO' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                    onClick={() => setPostType('PHOTO')}
                  >
                    <ImageIcon className="h-3.5 w-3.5" /> Photo
                  </Button>
                  <Button
                    type="button"
                    variant={postType === 'VIDEO' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs"
                    onClick={() => setPostType('VIDEO')}
                  >
                    <Video className="h-3.5 w-3.5" /> Video
                  </Button>
                  <Button
                    type="button"
                    variant={postType === 'LIVE_VIDEO' ? 'default' : 'outline'}
                    size="sm"
                    className="flex items-center gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={() => setPostType('LIVE_VIDEO')}
                  >
                    <Radio className="h-3.5 w-3.5" /> Live Stream
                  </Button>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <Label htmlFor="postTitle">Title</Label>
                <Input
                  id="postTitle"
                  placeholder={postType === 'LIVE_VIDEO' ? 'e.g. Sunday Morning Divine Service Live' : 'e.g. Synod Choir Performance'}
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>

              {/* Specific Fields depending on type */}
              {postType === 'PHOTO' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="postAlbum">Assign to Photo Album (optional)</Label>
                    <Select value={postAlbumId} onValueChange={setPostAlbumId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose album..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Album (General Media)</SelectItem>
                        {albumsQuery.data?.items.map((album) => (
                          <SelectItem key={album.id} value={album.id}>
                            {album.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Photo File</Label>
                    <input
                      ref={fileInputRef}
                      id="file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                      className="flex h-10 w-full items-center rounded-md border border-input bg-background text-sm file:mr-3 file:h-full file:border-0 file:bg-secondary file:px-3 file:text-sm"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">YouTube / Facebook Video ID or URL</Label>
                  <Input
                    id="videoUrl"
                    placeholder="e.g. dQw4w9WgXcQ or https://www.youtube.com/watch?v=..."
                    value={videoUrlOrId}
                    onChange={(e) => setVideoUrlOrId(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    You can paste full YouTube / Facebook URLs or just the Video ID over here.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="postDescription">Description / Notes (optional)</Label>
                <Textarea
                  id="postDescription"
                  placeholder="Details about this service or event..."
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {error && <p className="text-xs text-destructive font-medium">{error}</p>}
            </SheetBody>

            <SheetFooter>
              <Button type="submit" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="mr-1.5 h-4 w-4" /> Publish Post
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Dialog: Create New Album Modal */}
      <Dialog open={albumOpen} onOpenChange={setAlbumOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Photo Album</DialogTitle>
            <DialogDescription>
              Organize photos into dedicated albums for church services, conventions, and outreach events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="albumTitle">Album Title</Label>
              <Input
                id="albumTitle"
                placeholder="e.g. 2026 Easter Convention Highlights"
                value={albumTitle}
                onChange={(e) => setAlbumTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="albumDesc">Description (optional)</Label>
              <Textarea
                id="albumDesc"
                placeholder="Photos from the choir ministration and communion service..."
                value={albumDescription}
                onChange={(e) => setAlbumDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="albumCover">Cover Image URL (optional)</Label>
              <Input
                id="albumCover"
                placeholder="https://..."
                value={albumCoverUrl}
                onChange={(e) => setAlbumCoverUrl(e.target.value)}
              />
            </div>

            {error && <p className="text-xs text-destructive font-medium">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAlbumOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setError(null);
                albumMutation.mutate();
              }}
              disabled={albumMutation.isPending}
            >
              {albumMutation.isPending ? 'Creating…' : 'Create Album'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Live Stream Video Preview Modal */}
      {previewMedia && (
        <Dialog open={Boolean(previewMedia)} onOpenChange={() => setPreviewMedia(null)}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Badge variant="destructive">{previewMedia.type.replace('_', ' ')}</Badge>
                {previewMedia.title || previewMedia.filename}
              </DialogTitle>
              {previewMedia.description && <DialogDescription>{previewMedia.description}</DialogDescription>}
            </DialogHeader>

            <div className="aspect-16/9 w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={previewMedia.url}
                title={previewMedia.title || 'Video Player'}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <DialogFooter className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Platform: {previewMedia.platform}</span>
              <Button variant="outline" size="sm" onClick={() => setPreviewMedia(null)}>
                Close Player
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
