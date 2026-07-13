import { client } from "@/sanity/client";
import { getUserIdentity } from "./identity.service";

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
// - Existing doc → left untouched unless `patch` is given, in which case only
//   the defined patch fields are set (undefined/null keys are skipped so we
//   never unset an existing value).
export async function upsertSanityUser(
  input: SanityUserInput,
  patch?: Partial<{ name: string; image: string; phoneNumber: string }>,
): Promise<string> {
  // Match by phone (phone-only users) or by email — but only when non-null, so
  // two phone users (both email null) never match each other. A Google user
  // adding a phone still matches by their unchanged email.
  const existingId = await client.fetch<string | null>(
    '*[_type == "user" && (($phone != null && phoneNumber == $phone) || ($email != null && email == $email))][0]._id',
    { phone: input.phoneNumber, email: input.email },
  );

  if (existingId) {
    if (patch) {
      const set = Object.fromEntries(
        Object.entries(patch).filter(([, v]) => v != null),
      );
      if (Object.keys(set).length) {
        await client.patch(existingId).set(set).commit();
      }
    }
    return existingId;
  }

  const created = await client.create({ _type: "user", ...input });
  return created._id;
}

// Resolve the Sanity `user` doc _id for a logged-in user, anchored on the
// Postgres identity (source of truth). Self-heals: if the mirror doc is missing
// (login sync hadn't run), it is created on the fly — so content keyed by the
// Sanity _id (wishlists, reviews) never breaks due to a missed sync.
export async function resolveSanityUserId(userId: string): Promise<string> {
  const identity = await getUserIdentity(userId);
  return upsertSanityUser({
    name: identity.name,
    email: identity.email,
    image: identity.image,
    phoneNumber: identity.phoneNumber,
    provider: identity.provider,
    providerId: identity.providerId,
  });
}
