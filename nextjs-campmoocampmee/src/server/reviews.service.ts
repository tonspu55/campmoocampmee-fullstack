import { client } from "@/sanity/client";
import { ApiError } from "./http";
import { resolveSanityUserId } from "./users.service";

type CreateReviewInput = {
  authUserId: string;
  postId?: string;
  rating?: number;
  comment?: string;
};

// Create a pending review. Validates input first (to mirror original ordering),
// then resolves the user, then guards against duplicate reviews per post.
export async function createReview(input: CreateReviewInput) {
  const { authUserId, postId, rating, comment } = input;

  if (!postId || !rating || !comment) {
    throw new ApiError(400, "กรุณากรอกข้อมูลให้ครบถ้วน");
  }
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "คะแนนต้องอยู่ระหว่าง 1-5");
  }
  if (comment.length < 10 || comment.length > 1000) {
    throw new ApiError(400, "ความคิดเห็นต้องมีความยาว 10-1000 ตัวอักษร");
  }

  const userId = await resolveSanityUserId(authUserId);

  const existingReview = await client.fetch(
    '*[_type == "review" && post._ref == $postId && user._ref == $userId][0]',
    { postId, userId },
  );
  if (existingReview) {
    throw new ApiError(400, "คุณเคยรีวิวสถานที่นี้แล้ว");
  }

  const review = await client.create({
    _type: "review",
    post: { _type: "reference", _ref: postId },
    user: { _type: "reference", _ref: userId },
    rating,
    comment,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  return {
    message: "ส่งรีวิวสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ",
    review,
  };
}

// Fetch approved reviews for a post with the average rating.
export async function getApprovedReviews(postId: string) {
  const reviews = await client.fetch<{ rating: number }[]>(
    `*[_type == "review" && post._ref == $postId && status == "approved"] | order(createdAt desc) {
      _id,
      rating,
      comment,
      createdAt,
      "user": user->{name, image}
    }`,
    { postId },
  );

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews,
    averageRating: parseFloat(averageRating.toFixed(1)),
    totalReviews: reviews.length,
  };
}
