import { Metadata } from 'next';
import GalleryClient from './gallery-client';

export const metadata: Metadata = {
  title: 'Photo Gallery & Live Streams | Methodist Church Ghana',
  description: 'View photos of church services, choir ministrations, photo albums, and watch our YouTube and Facebook Live worship streams.',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <GalleryClient />
    </div>
  );
}
