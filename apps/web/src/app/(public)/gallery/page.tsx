import { Metadata } from 'next';
import GalleryClient from './gallery-client';

export const metadata: Metadata = {
  title: 'Photo Gallery & Live Streams | Methodist Church Ghana',
  description: 'View photos of church services, choir ministrations, photo albums, and watch our YouTube and Facebook Live worship streams.',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GalleryClient />
      </div>
    </div>
  );
}
