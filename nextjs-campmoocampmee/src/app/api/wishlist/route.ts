import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { client } from "@/sanity/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const user = await client.fetch(
      '*[_type == "user" && email == $email][0]{_id}',
      { email: session.user.email }
    );

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const full = searchParams.get("full") === "true";

    if (full) {
      const favorites = await client.fetch(
        `*[_type == "favorite" && user._ref == $userId] | order(createdAt desc) {
          "post": post->{
            _id,
            title,
            slug,
            thumbnail,
            "otherBenefits": otherBenefits{ priceOfStay },
            "address": address{ province, district }
          }
        }`,
        { userId: user._id }
      );

      const posts = favorites
        .map((f: { post: unknown }) => f.post)
        .filter(Boolean);

      return NextResponse.json({ posts });
    }

    const favorites = await client.fetch(
      `*[_type == "favorite" && user._ref == $userId]{ "postId": post._ref }`,
      { userId: user._id }
    );

    const favoriteIds = favorites.map((f: { postId: string }) => f.postId);

    return NextResponse.json({ favoriteIds });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการโปรด" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "กรุณาระบุ postId" },
        { status: 400 }
      );
    }

    const user = await client.fetch(
      '*[_type == "user" && email == $email][0]{_id}',
      { email: session.user.email }
    );

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // เช็ค duplicate
    const existing = await client.fetch(
      '*[_type == "favorite" && user._ref == $userId && post._ref == $postId][0]',
      { userId: user._id, postId }
    );

    if (existing) {
      return NextResponse.json(
        { error: "รายการนี้อยู่ในรายการโปรดแล้ว" },
        { status: 400 }
      );
    }

    await client.create({
      _type: "favorite",
      user: {
        _type: "reference",
        _ref: user._id,
      },
      post: {
        _type: "reference",
        _ref: postId,
      },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: "เพิ่มในรายการโปรดแล้ว" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเพิ่มรายการโปรด" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: "กรุณาระบุ postId" },
        { status: 400 }
      );
    }

    const user = await client.fetch(
      '*[_type == "user" && email == $email][0]{_id}',
      { email: session.user.email }
    );

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    const favorite = await client.fetch(
      '*[_type == "favorite" && user._ref == $userId && post._ref == $postId][0]{_id}',
      { userId: user._id, postId }
    );

    if (!favorite) {
      return NextResponse.json(
        { error: "ไม่พบรายการโปรดนี้" },
        { status: 404 }
      );
    }

    await client.delete(favorite._id);

    return NextResponse.json({ message: "ลบออกจากรายการโปรดแล้ว" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลบรายการโปรด" },
      { status: 500 }
    );
  }
}
