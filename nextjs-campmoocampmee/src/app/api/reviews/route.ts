import { NextRequest } from "next/server";
import { handleRoute, ApiError } from "@/server/http";
import { requireSession } from "@/server/session";
import { createReview, getApprovedReviews } from "@/server/reviews.service";

export const POST = handleRoute(async (req: NextRequest) => {
  const session = await requireSession("กรุณาเข้าสู่ระบบก่อนรีวิว");
  const { postId, rating, comment } = await req.json();

  const result = await createReview({
    authUserId: session.user.id,
    postId,
    rating,
    comment,
  });
  return { status: 201, body: result };
}, "เกิดข้อผิดพลาดในการส่งรีวิว");

export const GET = handleRoute(async (req: NextRequest) => {
  const postId = new URL(req.url).searchParams.get("postId");
  if (!postId) throw new ApiError(400, "กรุณาระบุ postId");

  return { body: await getApprovedReviews(postId) };
}, "เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว");
