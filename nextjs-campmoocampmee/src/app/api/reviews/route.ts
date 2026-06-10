import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { client } from "@/sanity/client";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนรีวิว" },
        { status: 401 }
      );
    }

    const { postId, rating, comment } = await request.json();

    // Validate input
    if (!postId || !rating || !comment) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "คะแนนต้องอยู่ระหว่าง 1-5" },
        { status: 400 }
      );
    }

    if (comment.length < 10 || comment.length > 1000) {
      return NextResponse.json(
        { error: "ความคิดเห็นต้องมีความยาว 10-1000 ตัวอักษร" },
        { status: 400 }
      );
    }

    // ดึงข้อมูล user จาก Sanity
    const user = await client.fetch(
      '*[_type == "user" && email == $email][0]{_id}',
      { email: session.user.email }
    );

    if (!user) {
      return NextResponse.json({ error: "ไม่พบข้อมูลผู้ใช้" }, { status: 404 });
    }

    // ตรวจสอบว่า user เคยรีวิว post นี้แล้วหรือยัง
    const existingReview = await client.fetch(
      '*[_type == "review" && post._ref == $postId && user._ref == $userId][0]',
      { postId, userId: user._id }
    );

    if (existingReview) {
      return NextResponse.json(
        { error: "คุณเคยรีวิวสถานที่นี้แล้ว" },
        { status: 400 }
      );
    }

    // สร้าง review ใหม่
    const newReview = await client.create({
      _type: "review",
      post: {
        _type: "reference",
        _ref: postId,
      },
      user: {
        _type: "reference",
        _ref: user._id,
      },
      rating,
      comment,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        message: "ส่งรีวิวสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ",
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งรีวิว" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");

    if (!postId) {
      return NextResponse.json({ error: "กรุณาระบุ postId" }, { status: 400 });
    }

    // ดึงรีวิวที่ได้รับอนุมัติแล้ว
    const reviews = await client.fetch(
      `*[_type == "review" && post._ref == $postId && status == "approved"] | order(createdAt desc) {
        _id,
        rating,
        comment,
        createdAt,
        "user": user->{name, image}
      }`,
      { postId }
    );

    // คำนวณคะแนนเฉลี่ย
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length
        : 0;

    return NextResponse.json({
      reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว" },
      { status: 500 }
    );
  }
}
