import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/sanity/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }

    // ดึง providerId จาก user
    const userData = await client.fetch(
      `*[_type == "user" && email == $email][0]{providerId}`,
      { email: session.user.email },
    );

    if (!userData?.providerId) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ต้องไม่เกิน 5MB" },
        { status: 400 },
      );
    }

    // Convert File to Buffer before magic-bytes check
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate via magic bytes — do not trust client-supplied MIME type
    const MAGIC: [string, number[]][] = [
      ["image/jpeg", [0xff, 0xd8, 0xff]],
      ["image/png", [0x89, 0x50, 0x4e, 0x47]],
      ["image/gif", [0x47, 0x49, 0x46, 0x38]],
      ["image/webp", [0x52, 0x49, 0x46, 0x46]],
    ];
    const detectedMime = MAGIC.find(([, sig]) =>
      sig.every((byte, i) => buffer[i] === byte),
    )?.[0];
    if (!detectedMime) {
      return NextResponse.json(
        { error: "อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WebP) เท่านั้น" },
        { status: 400 },
      );
    }

    // Upload to Sanity using server-detected MIME, not client value
    const asset = await client.assets.upload("image", buffer, {
      filename: file.name,
      contentType: detectedMime,
    });

    return NextResponse.json({
      assetId: asset._id,
      url: asset.url,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพโหลดไฟล์" },
      { status: 500 },
    );
  }
}
