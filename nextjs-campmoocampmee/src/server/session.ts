import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "./http";

// Resolve the current session or throw a 401. Note: phone-only users have a
// null `email` — read `session.user.id` for identity, not email.
export async function requireSession(message = "กรุณาเข้าสู่ระบบ") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new ApiError(401, message);
  return session;
}
