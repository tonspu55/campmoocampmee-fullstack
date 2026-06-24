import { NextRequest } from "next/server";
import { handleRoute } from "@/server/http";
import { submitContact } from "@/server/contact.service";

export const POST = handleRoute(async (req: NextRequest) => {
  const body = await req.json();

  // Extract client IP for rate limiting.
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0].trim() || realIp || "unknown";

  const result = await submitContact(body, ip);
  return { status: 201, body: result };
}, "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
