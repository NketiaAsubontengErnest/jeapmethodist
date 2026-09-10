import { join } from 'path';

/** Local-disk media storage — fine for a single self-hosted church deployment; revisit if this ever needs to scale beyond one server. */
export const MEDIA_UPLOAD_DIR = join(process.cwd(), 'uploads', 'media');

export const MEDIA_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const MEDIA_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];
