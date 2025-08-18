import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { client } from "@/sanity/client";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // บันทึกข้อมูล user ลง Sanity
          const existingUser = await client.fetch(
            '*[_type == "user" && email == $email][0]',
            { email: user.email }
          );

          if (!existingUser) {
            await client.create({
              _type: "user",
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider,
              providerId: account.providerAccountId,
            });
          }
          return true;
        } catch (error) {
          console.error("Error saving user to Sanity:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      // เพิ่มข้อมูล provider และ providerId จาก Sanity
      if (session.user?.email) {
        try {
          const userData = await client.fetch(
            '*[_type == "user" && email == $email][0]{name, email, image, provider, providerId}',
            { email: session.user.email }
          );
          if (userData) {
            (
              session.user as typeof session.user & {
                provider?: string;
                providerId?: string;
              }
            ).provider = userData.provider;
            (
              session.user as typeof session.user & {
                provider?: string;
                providerId?: string;
              }
            ).providerId = userData.providerId;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
