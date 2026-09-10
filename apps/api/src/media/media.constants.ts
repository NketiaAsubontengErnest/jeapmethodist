import { join } from 'path';
import { tmpdir } from 'os';

/** Local-disk media storage — uses /tmp on Vercel Serverless or process.cwd() locally. */
export const MEDIA_UPLOAD_DIR = process.env.VERCEL
  ? join(tmpdir(), 'uploads', 'media')
  : join(process.cwd(), 'uploads', 'media');

export const MEDIA_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];
