import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { client } from "@/sanity/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

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

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "อนุญาตเฉพาะไฟล์รูปภาพเท่านั้น" },
        { status: 400 },
      );
    }

    // Validate file size (max 1MB)
    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ต้องไม่เกิน 1MB" },
        { status: 400 },
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Sanity
    const asset = await client.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
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
