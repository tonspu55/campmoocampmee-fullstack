import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";

// Simple in-memory rate limiter — resets on server restart
// Protects against spam: max 5 submissions per IP per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

// Clean up stale entries every 5 minutes (best-effort)
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campName, phoneNumber, lineId } = body;

    // Extract client IP for rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0].trim() || realIp || "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "ขออภัย — ส่งข้อมูลมากเกินไป กรุณารอสักครู่" },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!campName || !phoneNumber) {
      return NextResponse.json(
        { error: "ชื่อแคมป์และเบอร์ติดต่อเป็นข้อมูลที่จำเป็น" },
        { status: 400 }
      );
    }

    // Validate phone number (Thai format: 10 digits)
    const phoneClean = phoneNumber.replace(/[\s\-()]/g, "");
    if (!/^[0-9]{10}$/.test(phoneClean)) {
      return NextResponse.json(
        { error: "เบอร์ติดต่อไม่ถุกต้อง (ตัวเลข 10 หลัก)" },
        { status: 400 }
      );
    }

    // Validate lineId length (max 50 chars, alphanumeric + underscore)
    if (lineId && (lineId.length > 50 || !/^[a-zA-Z0-9_\-]+$/.test(lineId))) {
      return NextResponse.json(
        { error: "ไอดี LINE ไม่ถุกต้อง" },
        { status: 400 }
      );
    }

    // Sanitize input — strip HTML tags to prevent XSS in stored data
    const sanitize = (str: string): string =>
      str.replace(/<[^>]*>/g, "").trim();

    const sanitizedCampName = sanitize(campName);
    if (sanitizedCampName.length < 2 || sanitizedCampName.length > 200) {
      return NextResponse.json(
        { error: "ชื่อแคมป์ต้องยาว 2-200 ตัวอักษร" },
        { status: 400 }
      );
    }

    // Check if Sanity token is configured
    if (!process.env.SANITY_API_TOKEN) {
      console.error("SANITY_API_TOKEN is not configured");
      return NextResponse.json(
        { error: "การกำหนดค่าเซิร์ฟเวอร์ไม่ถูกต้อง" },
        { status: 500 }
      );
    }

    // เตรียมข้อมูลสำหรับบันทึกใน Sanity
    const contactData = {
      _type: "submitContact",
      campName: sanitizedCampName,
      telNumber: phoneClean,
      lineId: lineId?.trim() || "",
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    // Create document in Sanity
    const result = await client.create(contactData);

    return NextResponse.json(
      {
        message:
          "ส่งข้อมูลเรียบร้อยแล้ว แคมป์หมูแคมป์หมี จะติดต่อกลับโดยเร็วที่สุด",
        id: result._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating contact submission:", error);

    // Check if it's a Sanity-specific error
    if (error instanceof Error) {
      if (error.message.includes("Insufficient permissions")) {
        return NextResponse.json(
          {
            error:
              "ไม่มีสิทธิ์ในการบันทึกข้อมูล กรุณาตรวจสอบการตั้งค่า API Token",
          },
          { status: 403 }
        );
      }
      if (error.message.includes("Unknown document type")) {
        return NextResponse.json(
          { error: "ประเภทเอกสารไม่ถูกต้อง กรุณาตรวจสอบ Schema" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
