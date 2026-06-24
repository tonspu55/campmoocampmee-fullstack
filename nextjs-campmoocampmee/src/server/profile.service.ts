import { prisma } from "@/lib/prisma";
import { ApiError } from "./http";
import { validateAndUploadImage } from "./media.service";
import { getUserIdentity } from "./identity.service";
import { upsertSanityUser } from "./users.service";

type UpdateProfileInput = {
  name: string;
  file: File | null;
};

// Update the logged-in user's profile (name + optional avatar). Writes to
// Postgres (source of truth) then best-effort mirrors to the Sanity user doc.
export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const rawName = input.name.trim();
  if (!rawName || rawName.length > 100) {
    throw new ApiError(400, "กรุณากรอกชื่อ (ไม่เกิน 100 ตัวอักษร)");
  }

  let imageUrl: string | undefined;
  if (input.file && input.file.size > 0) {
    imageUrl = (await validateAndUploadImage(input.file, 5)).url;
  }

  // 1) Postgres — source of truth.
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name: rawName, ...(imageUrl ? { image: imageUrl } : {}) },
  });

  // 2) Sanity mirror — best-effort, never blocks the response.
  try {
    const identity = await getUserIdentity(userId);
    await upsertSanityUser(
      {
        name: identity.name,
        email: identity.email,
        image: identity.image,
        phoneNumber: identity.phoneNumber,
        provider: identity.provider,
        providerId: identity.providerId,
      },
      { name: rawName, image: imageUrl },
    );
  } catch (err) {
    console.error("Sanity profile sync error:", err);
  }

  return { name: updated.name, image: updated.image };
}
