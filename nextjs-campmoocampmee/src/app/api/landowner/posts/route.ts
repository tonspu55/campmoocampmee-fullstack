import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/sanity/client";

// Disable static generation for this route
export const dynamic = "force-dynamic";

// ดึงข้อมูล post ทั้งหมดของเจ้าของลาน
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ", posts: [], providerId: null },
        { status: 401 },
      );
    }

    // ดึง providerId จาก user
    const userData = await client.fetch(
      `*[_type == "user" && email == $email][0]{providerId}`,
      { email: session.user.email },
    );

    if (!userData?.providerId) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้", posts: [], providerId: null },
        { status: 404 },
      );
    }

    // ดึง posts ที่ providerId อยู่ใน providerIds
    const posts = await client.fetch(
      `*[_type == "post" && $providerId in providerIds && !(_id in path("drafts.**"))] | order(publishedAt desc){
        _id,
        title,
        slug,
        thumbnail,
        publishedAt,
        address,
        "imageCount": count(gallery),
        "videoCount": count(videos)
      }`,
      { providerId: userData.providerId },
    );

    return NextResponse.json(
      { posts: posts || [], providerId: userData.providerId },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล", posts: [], providerId: null },
      { status: 500 },
    );
  }
}
