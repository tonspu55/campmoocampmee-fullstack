import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { client } from "@/sanity/client";

// Update the logged-in user's profile (name + optional avatar image).
// Writes to BOTH Postgres (source of truth) and the Sanity user mirror.
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    }
    const userId = session.user.id;

    const formData = await request.formData();
    const rawName = (formData.get("name") as string | null)?.trim() ?? "";
    const file = formData.get("file") as File | null;

    if (!rawName || rawName.length > 100) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ (ไม่เกิน 100 ตัวอักษร)" },
        { status: 400 },
      );
    }

    // ── Optional image upload → Sanity asset, reuse its CDN URL ──────────────
    let imageUrl: string | undefined;
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "ขนาดไฟล์ต้องไม่เกิน 5MB" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Validate via magic bytes — do not trust client-supplied MIME type.
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

      const asset = await client.assets.upload("image", buffer, {
        filename: file.name,
        contentType: detectedMime,
      });
      imageUrl = asset.url;
    }

    // ── 1) Update Postgres (source of truth) ────────────────────────────────
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name: rawName, ...(imageUrl ? { image: imageUrl } : {}) },
    });

    // ── 2) Mirror to Sanity (best-effort, never blocks the response) ─────────
    try {
      const existingId: string | null = await client.fetch(
        '*[_type == "user" && (($phone != null && phoneNumber == $phone) || email == $email)][0]._id',
        { phone: updated.phoneNumber, email: updated.email },
      );
      if (existingId) {
        await client
          .patch(existingId)
          .set({ name: rawName, ...(imageUrl ? { image: imageUrl } : {}) })
          .commit();
      } else {
        const googleAccount = await prisma.account.findFirst({
          where: { userId, providerId: "google" },
          select: { accountId: true },
        });
        await client.create({
          _type: "user",
          name: rawName,
          email: updated.email,
          image: imageUrl ?? updated.image,
          phoneNumber: updated.phoneNumber,
          provider: googleAccount ? "google" : "phone",
          providerId: googleAccount?.accountId ?? updated.phoneNumber ?? null,
        });
      }
    } catch (err) {
      console.error("Sanity profile sync error:", err);
    }

    return NextResponse.json({ name: updated.name, image: updated.image });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 },
    );
  }
}
