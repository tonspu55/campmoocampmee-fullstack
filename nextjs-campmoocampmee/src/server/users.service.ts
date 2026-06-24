import { client } from "@/sanity/client";
import { ApiError } from "./http";

// Resolve the Sanity `user` document _id for a logged-in user. Throws 404 if
// the mirror doc does not exist yet.
export async function getSanityUserIdByEmail(email: string): Promise<string> {
  const user = await client.fetch<{ _id: string } | null>(
    '*[_type == "user" && email == $email][0]{_id}',
    { email },
  );
  if (!user) throw new ApiError(404, "ไม่พบข้อมูลผู้ใช้");
  return user._id;
}

// Resolve the landowner providerId for a logged-in user. Throws 404 if the
// mirror doc or its providerId is missing.
export async function getProviderIdByEmail(email: string): Promise<string> {
  const data = await client.fetch<{ providerId: string | null } | null>(
    '*[_type == "user" && email == $email][0]{providerId}',
    { email },
  );
  if (!data?.providerId) throw new ApiError(404, "ไม่พบข้อมูลผู้ใช้");
  return data.providerId;
}

export type SanityUserInput = {
  name: string | null;
  email: string | null;
  image: string | null;
  phoneNumber: string | null;
  provider: "google" | "phone";
  providerId: string | null;
};

// Mirror a user into the Sanity `user` doc. Matches an existing doc by phone
// (phone-only users have a placeholder email) or email so re-syncs update
// rather than duplicate.
//
// - Missing doc → create with the full `input`.
// - Existing doc → left untouched unless `patch` is given, in which case its
//   name is set (and image only when `patch.image` is provided).
export async function upsertSanityUser(
  input: SanityUserInput,
  patch?: { name: string; image?: string },
): Promise<string> {
  const existingId = await client.fetch<string | null>(
    '*[_type == "user" && (($phone != null && phoneNumber == $phone) || email == $email)][0]._id',
    { phone: input.phoneNumber, email: input.email },
  );

  if (existingId) {
    if (patch) {
      await client
        .patch(existingId)
        .set({ name: patch.name, ...(patch.image ? { image: patch.image } : {}) })
        .commit();
    }
    return existingId;
  }

  const created = await client.create({ _type: "user", ...input });
  return created._id;
}
