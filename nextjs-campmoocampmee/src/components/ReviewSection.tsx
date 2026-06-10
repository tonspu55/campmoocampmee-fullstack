"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import UserDialog from "@/components/UserDialog";

interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    image?: string;
  };
}

interface ReviewSectionProps {
  postId: string;
}

export default function ReviewSection({ postId }: ReviewSectionProps) {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);

  const handleWriteReviewClick = () => {
    if (!session) {
      setUserDialogOpen(true);
    } else {
      document
        .getElementById("write-review-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ดึงข้อมูลรีวิว
  useEffect(() => {
    fetchReviews();
  }, [postId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?postId=${postId}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setAverageRating(data.averageRating);
        setTotalReviews(data.totalReviews);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setUserDialogOpen(true);
      return;
    }

    if (rating === 0) {
      toast.error("กรุณาให้คะแนน");
      return;
    }

    if (comment.length < 10) {
      toast.error("กรุณาเขียนความคิดเห็นอย่างน้อย 10 ตัวอักษร");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          rating,
          comment,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setRating(0);
        setComment("");
        // รีวิวจะแสดงหลังจากได้รับอนุมัติ
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการส่งรีวิว");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const filled = interactive
        ? starValue <= (hoveredRating || rating)
        : starValue <= currentRating;

      return (
        <Star
          key={index}
          className={`w-6 h-6 ${
            interactive ? "cursor-pointer" : ""
          } ${filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      );
    });
  };
  return (
    <div id="review-section" className="  max-lg:px-2">
      {/* สรุปคะแนนรีวิว */}
      <div className="flex flex-row gap-4 justify-between items-end  mb-4 mt-6">
        <h3 className="text-lg md:text-xl font-semibold ">
          รีวิวจากผู้เข้าพัก
        </h3>
        <p
          className="text-blue-500 cursor-pointer"
          onClick={handleWriteReviewClick}
        >
          เขียนรีวิว
        </p>
      </div>
      <UserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} />

      <div className="p-4  rounded-lg border border-gray-200 dark:border-primary">
        {totalReviews > 0 ? (
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{averageRating}</div>
            <div>
              <div className="flex">{renderStars(averageRating)}</div>
              <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
                จาก {totalReviews} รีวิว
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">ยังไม่มีรีวิว</p>
        )}
      </div>

      {/* แสดงรีวิวทั้งหมด */}
      {reviews.length > 0 && (
        <>
          <div className="grid lg:grid-cols-2 lg:gap-4 grid-cols-1 gap-2 mt-2 lg:mt-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className=" p-4  rounded-lg border border-gray-200 dark:border-primary"
              >
                <div className="flex  items-start gap-4">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                      {review.user.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{review.user.name}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-200">
                        {new Date(review.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div className="flex mb-2">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-200">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {session && (
        <div id="write-review-form">
          <h3 className="text-lg md:text-xl font-semibold mt-6 mb-4 ">
            เขียนรีวิว
          </h3>
          <div className="p-4  rounded-lg border border-gray-200 dark:border-primary">
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ให้คะแนน
                </label>
                <div className="flex gap-1">{renderStars(rating, true)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  ความคิดเห็น
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 border rounded-lg min-h-25"
                  placeholder="เขียนความคิดเห็นเกี่ยวกับสถานที่แห่งนี้ (อย่างน้อย 10 ตัวอักษร)"
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {comment.length}/1000 ตัวอักษร
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="basis-1/2 cursor-pointer w-full "
                >
                  {isSubmitting ? "กำลังส่ง..." : "ส่งรีวิว"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
