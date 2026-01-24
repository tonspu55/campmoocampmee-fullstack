import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { client } from "@/sanity/client";

// ดึงข้อมูล post ทั้งหมดของเจ้าของลาน
export async function GET() {
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

    // ดึง posts ที่ providerId ตรงกัน
    const posts = await client.fetch(
      `*[_type == "post" && providerId == $providerId && !(_id in path("drafts.**"))] | order(publishedAt desc){
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

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}
