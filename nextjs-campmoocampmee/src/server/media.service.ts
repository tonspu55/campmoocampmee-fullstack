import { client } from "@/sanity/client";
import { ApiError } from "./http";

// Magic-byte signatures — do not trust the client-supplied MIME type.
const MAGIC: [string, number[]][] = [
  ["image/jpeg", [0xff, 0xd8, 0xff]],
  ["image/png", [0x89, 0x50, 0x4e, 0x47]],
  ["image/gif", [0x47, 0x49, 0x46, 0x38]],
  ["image/webp", [0x52, 0x49, 0x46, 0x46]],
];

// Validate an uploaded image (size + magic bytes) and store it as a Sanity
// asset, using the server-detected MIME rather than the client value.
export async function validateAndUploadImage(
  file: File,
  maxSizeMB = 5,
): Promise<{ _id: string; url: string }> {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new ApiError(400, `ขนาดไฟล์ต้องไม่เกิน ${maxSizeMB}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const detectedMime = MAGIC.find(([, sig]) =>
    sig.every((byte, i) => buffer[i] === byte),
  )?.[0];
  if (!detectedMime) {
    throw new ApiError(
      400,
      "อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP) เท่านั้น",
    );
  }

  const asset = await client.assets.upload("image", buffer, {
    filename: file.name,
    contentType: detectedMime,
  });

  return { _id: asset._id, url: asset.url };
}
