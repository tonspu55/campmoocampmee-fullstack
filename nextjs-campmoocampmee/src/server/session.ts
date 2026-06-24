import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "./http";

// Resolve the current session or throw a 401. Phone-only users always have a
// placeholder email, so `user.email` is safe to read downstream.
export async function requireSession(message = "กรุณาเข้าสู่ระบบ") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new ApiError(401, message);
  return session;
}
