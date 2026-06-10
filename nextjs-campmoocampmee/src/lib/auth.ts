import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { client } from "@/sanity/client";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Session security
  session: {
    userAgent: true,
    expiresIn: 86400, // 1 day
    updateAge: 3600,  // refresh every hour of activity
  },
  // Cookie configuration — secure in production
  cookie: {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
  },
  // Sync user to Sanity CMS on every new session (after User + Account rows exist)
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          try {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              include: {
                accounts: { where: { providerId: "google" }, take: 1 },
              },
            });
            if (!user) return;

            const existing = await client.fetch(
              '*[_type == "user" && email == $email][0]',
              { email: user.email }
            );
            if (!existing) {
              await client.create({
                _type: "user",
                name: user.name,
                email: user.email,
                image: user.image,
                provider: "google",
                providerId: user.accounts[0]?.accountId ?? null,
              });
            }
          } catch (err) {
            // Don't throw — auth must succeed even if Sanity sync fails
            console.error("Sanity sync error:", err);
          }
        },
      },
    },
  },
});
