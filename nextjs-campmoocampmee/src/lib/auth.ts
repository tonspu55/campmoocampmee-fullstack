import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";
import { getUserIdentity } from "@/server/identity.service";
import { upsertSanityUser } from "@/server/users.service";

// Mirror a freshly-authenticated user into Sanity. Self-contained and never
// throws so it can be fired-and-forgotten off the login critical path. Only
// backfills a missing doc (no patch), so a missed run retries next login.
async function syncUserToSanity(userId: string) {
  try {
    const identity = await getUserIdentity(userId);
    await upsertSanityUser({
      name: identity.name,
      email: identity.email,
      image: identity.image,
      phoneNumber: identity.phoneNumber,
      provider: identity.provider,
      providerId: identity.providerId,
    });
  } catch (err) {
    // Don't throw — auth must succeed even if Sanity sync fails
    console.error("Sanity sync error:", err);
  }
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Account linking policy: methods are SEPARATE identities. We only auto-link
  // a Google sign-in to an existing user when the verified email matches
  // (allowDifferentEmails stays false). Google verifies emails, so this is safe
  // and prevents duplicate accounts for the same Google user. We intentionally
  // do NOT auto-merge phone (placeholder email) with Google — there is no shared
  // identifier, so merging would be unsafe; that stays a manual, explicit action.
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  // Phone number + OTP login. Better Auth generates/stores/verifies the OTP in
  // the existing Verification table; we only deliver it via SMS.
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 300, // 5 minutes
      allowedAttempts: 3,
      sendOTP: async ({ phoneNumber: phone, code }) => {
        await sendSms(phone, `รหัส OTP สำหรับเข้าสู่ระบบ CampMooCampMee คือ ${code}`);
      },
      // Create a user on first successful verification (phone-only signup).
      // Required email/name columns are filled with placeholders.
      signUpOnVerification: {
        // Strip non-digits so the placeholder is a valid email local-part
        // (E.164 numbers start with "+").
        getTempEmail: (phone) =>
          `${phone.replace(/[^0-9]/g, "")}@phone.campmoocampmee.com`,
        getTempName: (phone) => phone,
      },
    }),
  ],
  // Session security
  session: {
    // Serve the session from a short-lived signed cookie instead of hitting the
    // DB on every getSession/useSession call. Big latency win in production
    // (Supabase is in ap-south-1; without this every page read is a cross-region
    // round-trip). Reads bypass the cache with query.disableCookieCache.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
    userAgent: true,
    expiresIn: 60 * 60 * 24 * 15, // 15 days
    updateAge: 3600,              // refresh every hour of activity
  },
  // Cookie configuration — secure in production
  cookie: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
  },
  // Sync user to Sanity CMS on every new session (after User + Account rows exist).
  // Fired-and-forgotten so it never blocks the OAuth redirect or throws into the
  // sign-in flow. Guarded by an existence check, so a missed run retries next login.
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          void syncUserToSanity(session.userId);
        },
      },
    },
  },
});
