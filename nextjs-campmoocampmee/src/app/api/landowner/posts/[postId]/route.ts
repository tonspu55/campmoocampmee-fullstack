import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/sanity/client";

type RouteContext = {
  params: Promise<{ postId: string }>;
};

// ดึงข้อมูล post ตาม ID
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { postId } = await context.params;
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

    // ดึงข้อมูล post และตรวจสอบ providerIds
    const post = await client.fetch(
      `*[_type == "post" && _id == $postId && !(_id in path("drafts.**"))][0]{
        _id,
        title,
        slug,
        thumbnail{
          _type,
          asset->{
            _id,
            url
          }
        },
        providerIds,
        address,
        gallery[]{
          _key,
          _type,
          asset->{
            _id,
            url
          },
          category,
          alt,
          url,
          title,
          platform
        },
        body[]{
          _key,
          _type,
          style,
          children[]{
            _key,
            _type,
            text,
            marks
          },
          markDefs,
          listItem,
          level
        },
        socialContactLinks,
        otherBenefits
      }`,
      { postId },
    );

    if (!post) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลาน" }, { status: 404 });
    }

    // ตรวจสอบว่า providerId อยู่ใน providerIds หรือไม่
    if (!post.providerIds?.includes(userData.providerId)) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้" },
        { status: 403 },
      );
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูล" },
      { status: 500 },
    );
  }
}

// อัพเดทข้อมูล post
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { postId } = await context.params;
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

    // ดึงข้อมูล post และตรวจสอบ providerIds
    const post = await client.fetch(
      `*[_type == "post" && _id == $postId && !(_id in path("drafts.**"))][0]{_id, providerIds}`,
      { postId },
    );

    if (!post) {
      return NextResponse.json({ error: "ไม่พบข้อมูลลาน" }, { status: 404 });
    }

    // ตรวจสอบว่า providerId อยู่ใน providerIds หรือไม่
    if (!post.providerIds?.includes(userData.providerId)) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์แก้ไขข้อมูลนี้" },
        { status: 403 },
      );
    }

    // รับข้อมูลที่จะอัพเดท
    const body = await request.json();
    const {
      thumbnail,
      address,
      gallery,
      body: contentBody,
      socialContactLinks,
      otherBenefits,
    } = body;

    // สร้าง object สำหรับอัพเดท
    const updateData: Record<string, unknown> = {};

    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (address !== undefined) updateData.address = address;

    // Ensure all gallery items have _key
    if (gallery !== undefined) {
      const galleryWithKeys = gallery.map(
        (item: Record<string, unknown>, index: number) => {
          if (!item._key) {
            return {
              ...item,
              _key: `${item._type}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${index}`,
            };
          }
          return item;
        },
      );
      updateData.gallery = galleryWithKeys;
    }

    // Ensure all body blocks have _key
    if (contentBody !== undefined) {
      const bodyWithKeys = contentBody.map(
        (block: Record<string, unknown>, index: number) => {
          if (!block._key) {
            return {
              ...block,
              _key: `block-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${index}`,
            };
          }
          // Ensure children have _key
          if (block.children && Array.isArray(block.children)) {
            const childrenWithKeys = block.children.map(
              (child: Record<string, unknown>, childIndex: number) => {
                if (!child._key) {
                  return {
                    ...child,
                    _key: `span-${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${index}-${childIndex}`,
                  };
                }
                return child;
              },
            );
            return { ...block, children: childrenWithKeys };
          }
          return block;
        },
      );
      updateData.body = bodyWithKeys;
    }

    if (socialContactLinks !== undefined)
      updateData.socialContactLinks = socialContactLinks;
    if (otherBenefits !== undefined) updateData.otherBenefits = otherBenefits;

    // อัพเดทข้อมูล
    const updatedPost = await client.patch(postId).set(updateData).commit();

    return NextResponse.json({
      message: "อัพเดทข้อมูลสำเร็จ",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัพเดทข้อมูล" },
      { status: 500 },
    );
  }
}
