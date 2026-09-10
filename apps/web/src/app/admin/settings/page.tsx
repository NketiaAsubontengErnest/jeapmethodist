'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Loader2, Save, Upload } from 'lucide-react';
import { fetchSettings, updateSettings, type SettingsMap } from '@/lib/api/settings';
import { uploadMedia } from '@/lib/api/media';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatMediaUrl } from '@/lib/utils';

interface FieldSpec {
  key: keyof SettingsMap;
  label: string;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}

interface SectionSpec {
  title: string;
  description: string;
  fields: FieldSpec[];
}

const SECTIONS: SectionSpec[] = [
  {
    title: 'Church identity',
    description: 'Shown throughout the public website, headers, footers, and browser tab.',
    fields: [
      { key: 'church_name', label: 'Church / Denomination name', placeholder: 'Methodist Church Ghana' },
      { key: 'society_name', label: 'Society name', placeholder: 'Trinity Society' },
      { key: 'slogan', label: 'Society slogan', placeholder: 'Sure and Steadfast!' },
      { key: 'tagline', label: 'Tagline / Motto', placeholder: 'Worshipping God, Serving Humanity' },
      { key: 'logo_url', label: 'Logo URL', type: 'url' },
      { key: 'favicon_url', label: 'Favicon URL', type: 'url' },
    ],
  },
  {
    title: 'Contact & Secretariat hours',
    description: 'Displayed on the Contact, Visit Us, Header, and Footer sections.',
    fields: [
      { key: 'address', label: 'Physical Location / Address', textarea: true, placeholder: 'Methodist Church Ghana, Cathedral Avenue, Accra / Circuit Headquarters' },
      { key: 'phone', label: 'Phone Contacts', placeholder: '+233 30 200 0000 / +233 24 000 0000' },
      { key: 'email', label: 'Email Enquiries', type: 'email', placeholder: 'info@methodistchurch.org.gh' },
      { key: 'whatsapp', label: 'WhatsApp', placeholder: '+233 24 000 0000' },
      { key: 'secretariat_hours', label: 'Secretariat Hours', placeholder: 'Monday – Friday: 8:00 AM – 5:00 PM' },
    ],
  },
  {
    title: 'Sunday & Mid-Week Service Schedule',
    description: 'Displayed on Visit Us, Contact, Header, and Footer pages.',
    fields: [
      { key: 'sunday_service_1', label: '1st Sunday Service', placeholder: '1st Service (Fante / Vernacular) — 7:00 AM' },
      { key: 'sunday_service_2', label: '2nd Sunday Service', placeholder: '2nd Service (English Service) — 9:30 AM' },
      { key: 'midweek_service', label: 'Mid-Week Service', placeholder: 'Mid-Week Prayer & Bible Study — Wed 6:00 PM' },
      { key: 'sunday_service_times', label: 'Sunday service times summary', textarea: true },
      { key: 'midweek_service_times', label: 'Midweek service times summary', textarea: true },
    ],
  },
  {
    title: 'About the church',
    description: 'Used on the About page.',
    fields: [
      { key: 'about_text', label: 'About text', textarea: true },
      { key: 'mission', label: 'Mission', textarea: true },
      { key: 'vision', label: 'Vision', textarea: true },
    ],
  },
  {
    title: 'Giving details',
    description: 'Shown on the public Giving page. No online payments are processed — these are informational only.',
    fields: [
      { key: 'momo_number', label: 'Mobile Money number' },
      { key: 'bank_name', label: 'Bank name' },
      { key: 'bank_account_number', label: 'Bank account number' },
    ],
  },
  {
    title: 'Social media',
    description: 'Only configured networks are shown on the public site.',
    fields: [
      { key: 'facebook_url', label: 'Facebook URL', type: 'url' },
      { key: 'youtube_url', label: 'YouTube URL', type: 'url' },
      { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
      { key: 'tiktok_url', label: 'TikTok URL', type: 'url' },
      { key: 'x_url', label: 'X (Twitter) URL', type: 'url' },
    ],
  },
  {
    title: 'Homepage & footer',
    description: 'The hero banner text on the homepage and the footer note.',
    fields: [
      { key: 'hero_title', label: 'Hero title' },
      { key: 'hero_subtitle', label: 'Hero subtitle / Mission slogan', textarea: true },
      { key: 'footer_text', label: 'Footer text', textarea: true },
    ],
  },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [unlockedFields, setUnlockedFields] = useState<Record<string, boolean>>({});

  const logoFileRef = useRef<HTMLInputElement>(null);
  const faviconFileRef = useRef<HTMLInputElement>(null);

  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: fetchSettings });
  const { register, handleSubmit, reset, setValue, watch } = useForm<SettingsMap>();

  const formValues = watch();
  const logoUrl = watch('logo_url');
  const faviconUrl = watch('favicon_url');

  useEffect(() => {
    if (settingsQuery.data) {
      reset(settingsQuery.data);
    }
  }, [settingsQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      setSuccess(true);
      setError(null);
      // Re-lock all link fields after successful save
      setUnlockedFields({});
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to save settings'),
  });

  const handleFileUpload = async (field: 'logo_url' | 'favicon_url', file: File) => {
    try {
      setUploadingField(field);
      setError(null);
      const res = await uploadMedia(file, { category: 'identity', title: field });
      setValue(field, res.url);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image file');
    } finally {
      setUploadingField(null);
    }
  };

  const isUrlField = (key: string) =>
    ['logo_url', 'favicon_url', 'facebook_url', 'youtube_url', 'instagram_url', 'tiktok_url', 'x_url'].includes(key);

  const toggleUnlock = (key: string) => {
    setUnlockedFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (settingsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Website Settings</h1>
        <p className="text-muted-foreground">
          Content shown on the public website. Changes take effect immediately — no code changes needed.
        </p>
      </div>

      <input
        ref={logoFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload('logo_url', file);
        }}
      />

      <input
        ref={faviconFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload('favicon_url', file);
        }}
      />

      <form
        onSubmit={handleSubmit((values) => {
          setError(null);
          // Sanitize values to send clean object
          const payload: Partial<SettingsMap> = {};
          for (const [k, v] of Object.entries(values)) {
            if (v !== undefined && v !== null) {
              payload[k as keyof SettingsMap] = v;
            }
          }
          mutation.mutate(payload as SettingsMap);
        })}
        className="space-y-6"
      >
        {SECTIONS.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="text-base">{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => {
                const currentValue = formValues[field.key];
                const isUrl = isUrlField(field.key);
                const isLocked = isUrl && Boolean(currentValue) && !unlockedFields[field.key];

                return (
                  <div key={field.key} className={field.textarea ? 'space-y-2 sm:col-span-2' : 'space-y-2'}>
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.key} className="flex items-center gap-2">
                        {field.label}
                        {isLocked && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            Saved &amp; Locked
                          </span>
                        )}
                      </Label>

                      <div className="flex items-center gap-2">
                        {isUrl && Boolean(currentValue) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => toggleUnlock(field.key)}
                          >
                            {unlockedFields[field.key] ? 'Lock Link' : 'Edit Link'}
                          </Button>
                        )}

                        {(field.key === 'logo_url' || field.key === 'favicon_url') && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs font-semibold text-amber-600 hover:text-amber-700"
                            disabled={uploadingField === field.key}
                            onClick={() => {
                              if (field.key === 'logo_url') logoFileRef.current?.click();
                              if (field.key === 'favicon_url') faviconFileRef.current?.click();
                            }}
                          >
                            {uploadingField === field.key ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="mr-1 h-3 w-3" />
                            )}
                            Upload File
                          </Button>
                        )}
                      </div>
                    </div>

                    {field.textarea ? (
                      <Textarea id={field.key} rows={3} {...register(field.key)} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          id={field.key}
                          type={field.type ?? 'text'}
                          placeholder={field.placeholder}
                          readOnly={isLocked}
                          className={isLocked ? 'bg-muted/50 cursor-not-allowed text-muted-foreground' : ''}
                          {...register(field.key)}
                        />
                      </div>
                    )}

                    {/* Image Preview for Logo & Favicon */}
                    {field.key === 'logo_url' && logoUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formatMediaUrl(logoUrl)} alt="Logo preview" className="h-10 w-10 rounded-full border bg-white object-contain p-1" />
                        <span className="text-xs text-muted-foreground">Logo preview</span>
                      </div>
                    )}

                    {field.key === 'favicon_url' && faviconUrl && (
                      <div className="flex items-center gap-3 pt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={formatMediaUrl(faviconUrl)} alt="Favicon preview" className="h-6 w-6 border bg-white object-contain p-0.5 rounded" />
                        <span className="text-xs text-muted-foreground">Favicon preview</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={mutation.isPending}>
            <Save className="h-4 w-4" />
            {mutation.isPending ? 'Saving…' : 'Save changes'}
          </Button>
          {success && <p className="text-sm text-green-700 dark:text-green-400">Saved successfully.</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </form>
    </div>
  );
}
