import { client } from "@/sanity/client";
import { ApiError } from "./http";

// Simple in-memory rate limiter — resets on server restart.
// Protects against spam: max 5 submissions per IP per 10 minutes.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;

  entry.count += 1;
  return true;
}

// Clean up stale entries every 5 minutes (best-effort).
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) rateLimitStore.delete(ip);
  }
}, 5 * 60 * 1000);

// Strip HTML tags to prevent XSS in stored data.
const sanitize = (str: string): string => str.replace(/<[^>]*>/g, "").trim();

type ContactInput = {
  campName?: string;
  phoneNumber?: string;
  lineId?: string;
};

// Validate, rate-limit and store a landowner contact submission.
export async function submitContact(input: ContactInput, ip: string) {
  if (!checkRateLimit(ip)) {
    throw new ApiError(429, "ขออภัย — ส่งข้อมูลมากเกินไป กรุณารอสักครู่");
  }

  const { campName, phoneNumber, lineId } = input;

  if (!campName || !phoneNumber) {
    throw new ApiError(400, "ชื่อแคมป์และเบอร์ติดต่อเป็นข้อมูลที่จำเป็น");
  }

  const phoneClean = phoneNumber.replace(/[\s\-()]/g, "");
  if (!/^[0-9]{10}$/.test(phoneClean)) {
    throw new ApiError(400, "เบอร์ติดต่อไม่ถุกต้อง (ตัวเลข 10 หลัก)");
  }

  if (lineId && (lineId.length > 50 || !/^[a-zA-Z0-9_\-]+$/.test(lineId))) {
    throw new ApiError(400, "ไอดี LINE ไม่ถุกต้อง");
  }

  const sanitizedCampName = sanitize(campName);
  if (sanitizedCampName.length < 2 || sanitizedCampName.length > 200) {
    throw new ApiError(400, "ชื่อแคมป์ต้องยาว 2-200 ตัวอักษร");
  }

  if (!process.env.SANITY_API_TOKEN) {
    console.error("SANITY_API_TOKEN is not configured");
    throw new ApiError(500, "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง");
  }

  try {
    const result = await client.create({
      _type: "submitContact",
      campName: sanitizedCampName,
      telNumber: phoneClean,
      lineId: lineId?.trim() || "",
      submittedAt: new Date().toISOString(),
      status: "pending",
    });

    return {
      message:
        "ส่งข้อมูลเรียบร้อยแล้ว แคมป์หมูแคมป์หมี จะติดต่อกลับโดยเร็วที่สุด",
      id: result._id,
    };
  } catch (error) {
    // Map known Sanity errors to friendlier responses.
    if (error instanceof Error) {
      if (error.message.includes("Insufficient permissions")) {
        throw new ApiError(
          403,
          "ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาตรวจสอบการตั้งค่า API Token",
        );
      }
      if (error.message.includes("Unknown document type")) {
        throw new ApiError(400, "ประเภทเอกสารไม่ถูกต้อง กรุณาตรวจสอบ Schema");
      }
    }
    throw error;
  }
}
