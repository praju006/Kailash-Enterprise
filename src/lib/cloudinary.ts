// Client-side unsigned uploads to Cloudinary.
// Uses an unsigned upload preset, so no API secret is needed in the browser.
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
const FOLDER = 'kailash_products';

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Uploads a single image file to Cloudinary and returns a delivery URL with
 * automatic format + quality optimisation baked in.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  if (!cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', UPLOAD_PRESET);
  form.append('folder', FOLDER);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new Error(detail?.error?.message || `Upload failed (${res.status}).`);
  }

  const data = (await res.json()) as { secure_url: string };
  // Insert f_auto,q_auto so Cloudinary serves an optimised, right-sized image.
  return data.secure_url.replace('/upload/', '/upload/f_auto,q_auto/');
}
