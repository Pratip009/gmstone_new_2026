// lib/cloudinary.ts
// Single place to configure Cloudinary and expose a typed upload helper.
// Import this in your route handlers — never paste the config inline.

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export { cloudinary };

// ── uploadBuffer ────────────────────────────────────────────────────────────
// Wraps cloudinary.uploader.upload_stream in a Promise so you can await it.
// folder   : Cloudinary folder, e.g. "subcategories"
// filename : Original filename — used to build a readable public_id
export async function uploadBuffer(
  buffer: Buffer,
  filename: string,
  folder = 'subcategories'
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        // strip extension from filename so Cloudinary doesn't double it
        public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, '')}`,
        overwrite: false,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },   // cap dimensions
          { quality: 'auto', fetch_format: 'auto' },    // auto-optimise
        ],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

// ── destroyImage ────────────────────────────────────────────────────────────
// Silently deletes an image from Cloudinary.
// Never throws — a failed delete should not block the main operation.
export async function destroyImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn('[Cloudinary] destroy failed for', publicId, err);
  }
}