'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Trash2,
  Edit,
  Loader2,
  Plus,
  Image as ImageIcon,
  SlidersHorizontal,
  Save,
  AlertCircle,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';
import {
  fetchMediaAdmin,
  uploadMedia,
  updateMedia,
  deleteMedia,
  createExternalImage,
  type MediaItem,
} from '@/lib/api/media';
import { fetchSettings, updateSettings } from '@/lib/api/settings';
import { formatMediaUrl, compressImage } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type AddMode = 'upload' | 'url';

export default function HeroSlidesAdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: mediaData, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['admin-hero-slides'],
    queryFn: () => fetchMediaAdmin({ category: 'hero_slide', pageSize: 50 }),
  });

  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['admin-settings-hero'],
    queryFn: fetchSettings,
  });

  // State — upload tab
  const [addMode, setAddMode] = useState<AddMode>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideDescription, setSlideDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // State — URL / link tab
  const [externalUrl, setExternalUrl] = useState('');
  const [urlSlideTitle, setUrlSlideTitle] = useState('');
  const [urlSlideDescription, setUrlSlideDescription] = useState('');

  // Hero Text Settings State
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (settings && !isSettingsLoaded) {
    setHeroTitle(settings.hero_title || '');
    setHeroSubtitle(settings.hero_subtitle || '');
    setIsSettingsLoaded(true);
  }

  const slides = mediaData?.items || [];

  // File Select Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Upload Mutation (file)
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('Please select an image file to upload.');
      setIsUploading(true);
      try {
        const fileToUpload = selectedFile.type.startsWith('image/')
          ? await compressImage(selectedFile, 1920, 1080, 0.85)
          : selectedFile;
        return await uploadMedia(fileToUpload, {
          category: 'hero_slide',
          title: slideTitle.trim() || undefined,
          description: slideDescription.trim() || undefined,
        });
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      toast.success('Hero slide uploaded successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery-home'] });
      setSelectedFile(null);
      setPreviewUrl(null);
      setSlideTitle('');
      setSlideDescription('');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to upload hero slide image.';
      toast.error('Upload failed', msg);
    },
  });

  // External URL Mutation
  const externalUrlMutation = useMutation({
    mutationFn: async () => {
      const trimmed = externalUrl.trim();
      if (!trimmed) throw new Error('Please enter a valid image URL.');
      return await createExternalImage({
        imageUrl: trimmed,
        title: urlSlideTitle.trim() || undefined,
        description: urlSlideDescription.trim() || undefined,
        category: 'hero_slide',
      });
    },
    onSuccess: () => {
      toast.success('Hero slide linked successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery-home'] });
      setExternalUrl('');
      setUrlSlideTitle('');
      setUrlSlideDescription('');
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : 'Failed to link external image.';
      toast.error('Link failed', msg);
    },
  });

  // Edit Mutation
  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editingItem) return;
      return await updateMedia(editingItem.id, {
        title: editTitle.trim() || undefined,
        description: editDescription.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Hero slide updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      setEditingItem(null);
    },
    onError: (err) => {
      toast.error('Update failed', err instanceof ApiError ? err.message : 'Failed to update slide.');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: () => {
      toast.success('Hero slide removed.');
      queryClient.invalidateQueries({ queryKey: ['admin-hero-slides'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery-home'] });
      setDeletingId(null);
    },
    onError: (err) => {
      toast.error('Delete failed', err instanceof ApiError ? err.message : 'Failed to delete slide.');
    },
  });

  // Settings Save Mutation
  const settingsMutation = useMutation({
    mutationFn: () => updateSettings({ hero_title: heroTitle, hero_subtitle: heroSubtitle }),
    onSuccess: () => {
      toast.success('Hero title & subtitle updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-settings-hero'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
    },
    onError: (err) => {
      toast.error('Failed to save settings', err instanceof ApiError ? err.message : 'Error updating text settings');
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="h-6 w-6 text-[#14309c]" />
          Hero Section Slides
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Add slide images via file upload or external link (Facebook, Cloudinary, etc.) and configure the homepage hero banner.
        </p>
      </div>

      {/* Hero Headline Text Settings */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">Main Hero Headline &amp; Subtitle</CardTitle>
          <CardDescription>
            Primary heading and subtitle displayed over the homepage hero section.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hero_title" className="font-semibold text-xs text-slate-700">
                Hero Headline
              </Label>
              <Input
                id="hero_title"
                placeholder="e.g. Welcome to Trinity Methodist Society"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero_subtitle" className="font-semibold text-xs text-slate-700">
                Hero Subtitle
              </Label>
              <Input
                id="hero_subtitle"
                placeholder="e.g. Worshipping God, Serving Humanity"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => settingsMutation.mutate()}
              disabled={settingsMutation.isPending || isLoadingSettings}
              className="bg-[#14309c] text-white hover:bg-[#0f2478]"
            >
              {settingsMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Hero Text
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Slide Card — Tabbed */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-[#14309c]" />
            Add New Hero Slide
          </CardTitle>
          <CardDescription>
            Upload an image from your device or paste a direct image link from Facebook albums, Cloudinary, Google Photos, or any public image URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Mode Toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit">
            <button
              type="button"
              onClick={() => setAddMode('upload')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                addMode === 'upload'
                  ? 'bg-white text-[#14309c] shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setAddMode('url')}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                addMode === 'url'
                  ? 'bg-white text-[#14309c] shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              Link from URL
            </button>
          </div>

          {/* ── Upload Tab ── */}
          {addMode === 'upload' && (
            <div className="grid gap-6 md:grid-cols-12 items-start">
              {/* File Picker */}
              <div className="md:col-span-5 space-y-3">
                <Label className="font-semibold text-xs text-slate-700">Select Image File</Label>
                <div
                  className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-6 transition-all hover:border-[#14309c] bg-slate-50 cursor-pointer overflow-hidden min-h-[180px]"
                  onClick={() => document.getElementById('hero-file-input')?.click()}
                >
                  {previewUrl ? (
                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-md">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <Upload className="mx-auto h-9 w-9 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700">Click to choose image file</p>
                      <p className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 10 MB</p>
                    </div>
                  )}
                  <input
                    id="hero-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slide_title" className="font-semibold text-xs text-slate-700">Caption Title (Optional)</Label>
                  <Input id="slide_title" placeholder="e.g. Annual Harvest Thanksgiving 2026" value={slideTitle} onChange={(e) => setSlideTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slide_desc" className="font-semibold text-xs text-slate-700">Subtitle / Details (Optional)</Label>
                  <Textarea id="slide_desc" rows={3} placeholder="e.g. Join us as we praise the Lord for His bountiful blessings." value={slideDescription} onChange={(e) => setSlideDescription(e.target.value)} />
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    onClick={() => uploadMutation.mutate()}
                    disabled={!selectedFile || isUploading}
                    className="bg-[#14309c] text-white hover:bg-[#0f2478]"
                  >
                    {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Upload Slide
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Link from URL Tab ── */}
          {addMode === 'url' && (
            <div className="space-y-5">
              {/* Help tip */}
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="text-xs text-blue-700 leading-relaxed">
                  <p className="font-bold mb-1">How to get a direct image link from Facebook:</p>
                  <ol className="list-decimal list-inside space-y-0.5 ml-1">
                    <li>Open the Facebook album and click on the photo you want.</li>
                    <li>Right-click (or long-press) the image and choose <strong>"Copy image address"</strong>.</li>
                    <li>Paste the link below. It should end with <code>.jpg</code>, <code>.png</code>, or <code>.webp</code>.</li>
                  </ol>
                  <p className="mt-2 text-blue-600">You can also paste links from <strong>Google Drive</strong>, <strong>Cloudinary</strong>, <strong>Dropbox</strong>, or any public direct image URL.</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-12 items-start">
                <div className="md:col-span-7 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ext_url" className="font-semibold text-xs text-slate-700">
                      Direct Image URL <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="ext_url"
                      type="url"
                      placeholder="https://scontent.example.com/photo.jpg"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url_title" className="font-semibold text-xs text-slate-700">Caption Title (Optional)</Label>
                    <Input id="url_title" placeholder="e.g. Men's Fellowship Camp 2026" value={urlSlideTitle} onChange={(e) => setUrlSlideTitle(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="url_desc" className="font-semibold text-xs text-slate-700">Subtitle / Details (Optional)</Label>
                    <Textarea id="url_desc" rows={2} placeholder="Short description of the image…" value={urlSlideDescription} onChange={(e) => setUrlSlideDescription(e.target.value)} />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button
                      onClick={() => externalUrlMutation.mutate()}
                      disabled={!externalUrl.trim() || externalUrlMutation.isPending}
                      className="bg-[#14309c] text-white hover:bg-[#0f2478]"
                    >
                      {externalUrlMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                      Link Slide Image
                    </Button>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="md:col-span-5">
                  <Label className="font-semibold text-xs text-slate-700 block mb-2">Live Preview</Label>
                  <div className="h-44 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center">
                    {externalUrl.trim() ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={externalUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="text-center text-slate-400">
                        <ImageIcon className="mx-auto h-8 w-8 mb-1" />
                        <p className="text-xs">Paste a URL to preview</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Slides List */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Uploaded Hero Slides ({slides.length})
          </CardTitle>
          <CardDescription>
            All hero slides currently in the media library — both uploaded and externally linked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingMedia ? (
            <div className="flex items-center justify-center py-12 text-slate-500">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading hero slides…
            </div>
          ) : slides.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <ImageIcon className="mx-auto h-12 w-12 text-slate-300" />
              <p className="text-sm font-medium">No hero slide images yet.</p>
              <p className="text-xs text-slate-400">Upload a file or link an image URL above.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="group relative flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md"
                >
                  {/* Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formatMediaUrl(slide.url)}
                      alt={slide.title || 'Hero Slide'}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* External badge */}
                    {slide.mimeType === 'image/external' && (
                      <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                        <Globe className="h-3 w-3" /> External
                      </span>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5 bg-black/60 p-1 rounded-lg backdrop-blur-sm">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={() => {
                          setEditingItem(slide);
                          setEditTitle(slide.title || '');
                          setEditDescription(slide.description || '');
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        onClick={() => setDeletingId(slide.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                        {slide.title || 'Untitled Slide'}
                      </h4>
                      {slide.description ? (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">{slide.description}</p>
                      ) : (
                        <p className="text-xs italic text-slate-400 mt-1">No caption provided</p>
                      )}
                    </div>
                    <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                      <span>Added {new Date(slide.createdAt).toLocaleDateString()}</span>
                      <span className="font-mono text-[10px]">
                        {slide.mimeType === 'image/external' ? 'URL Link' : slide.mimeType.split('/')[1]?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Slide Dialog */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(v: boolean) => !v && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Hero Slide Details</DialogTitle>
            <DialogDescription>Update caption title or subtitle for this slide.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit_title" className="text-xs font-semibold">Title</Label>
              <Input id="edit_title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Slide title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_desc" className="text-xs font-semibold">Description / Subtitle</Label>
              <Textarea id="edit_desc" rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Slide details" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button
              onClick={() => editMutation.mutate()}
              disabled={editMutation.isPending}
              className="bg-[#14309c] text-white hover:bg-[#0f2478]"
            >
              {editMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={Boolean(deletingId)} onOpenChange={(v: boolean) => !v && setDeletingId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Delete Hero Slide
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hero slide? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete Slide'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
