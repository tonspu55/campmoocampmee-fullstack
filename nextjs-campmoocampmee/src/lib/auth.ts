import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { client } from "@/sanity/client";
import { sendSms } from "@/lib/sms";

// Mirror a freshly-authenticated user into Sanity. Self-contained and never
// throws so it can be fired-and-forgotten off the login critical path.
async function syncUserToSanity(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: { where: { providerId: "google" }, take: 1 },
      },
    });
    if (!user) return;

    const googleAccount = user.accounts[0];
    // A user may sign up with phone only, Google only, or link both later.
    const provider = googleAccount ? "google" : "phone";
    const providerId = googleAccount?.accountId ?? user.phoneNumber ?? null;

    // Match an existing Sanity doc by phone (phone-only users have a
    // placeholder email) or email, so re-syncs update rather than duplicate.
    const existing = await client.fetch(
      '*[_type == "user" && (($phone != null && phoneNumber == $phone) || email == $email)][0]._id',
      { phone: user.phoneNumber, email: user.email }
    );
    if (!existing) {
      await client.create({
        _type: "user",
        name: user.name,
        email: user.email,
        image: user.image,
        phoneNumber: user.phoneNumber,
        provider,
        providerId,
      });
    }
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
