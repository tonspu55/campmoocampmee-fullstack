import { prisma } from "@/lib/prisma";
import { ApiError } from "./http";

export type UserIdentity = {
  /** How the user authenticates today (for the Sanity mirror's `provider`). */
  provider: "google" | "phone";
  /** Stable per-user key used to scope content (Google accountId or phone). */
  providerId: string;
  name: string;
  email: string | null;
  image: string | null;
  phoneNumber: string | null;
};

// Resolve a user's identity + providerId straight from Postgres (the source of
// truth) — never from the Sanity mirror. Authorization/scoping must not depend
// on the best-effort CMS sync having run.
export async function getUserIdentity(userId: string): Promise<UserIdentity> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { where: { providerId: "google" }, take: 1 } },
  });
  if (!user) throw new ApiError(401, "ไม่พบข้อมูลผู้ใช้");

  // A user may sign up with phone only, Google only, or both.
  const googleAccount = user.accounts[0];
  const providerId = googleAccount?.accountId ?? user.phoneNumber;
  if (!providerId) throw new ApiError(400, "บัญชีไม่มีตัวระบุผู้ใช้");

  return {
    provider: googleAccount ? "google" : "phone",
    providerId,
    name: user.name,
    email: user.email,
    image: user.image,
    phoneNumber: user.phoneNumber,
  };
}
