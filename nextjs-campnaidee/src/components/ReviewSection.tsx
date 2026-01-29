"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import Image from 'next/image'


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
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      signIn("google", { callbackUrl: window.location.href });
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
    } catch (error) {
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
          className={`w-6 h-6 ${interactive ? "cursor-pointer" : ""
            } ${filled ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          onClick={() => interactive && setRating(starValue)}
          onMouseEnter={() => interactive && setHoveredRating(starValue)}
          onMouseLeave={() => interactive && setHoveredRating(0)}
        />
      );
    });
  };

  return (
    <div id="review-section" className="mt-8 space-y-6 px-2">
      {/* สรุปคะแนนรีวิว */}
      <h3 className="text-lg md:text-xl font-semibold mb-4">รีวิวจากผู้เข้าพัก</h3>
      <div className=" p-6 rounded-lg border border-gray-200 dark:border-primary">

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
        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-semibold">รีวิวทั้งหมด</h3>
          <div className="flex flex-col lg:flex-row gap-4">
            {reviews.map((review) => (
              <div key={review._id} className=" lg:basis-1/3 p-6 rounded-lg border border-gray-200 dark:border-primary">
                <div className="flex items-start gap-4">
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
                    <div className="flex mb-2">{renderStars(review.rating)}</div>
                    <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ฟอร์มเขียนรีวิว */}
      <h3 className="text-lg md:text-xl font-semibold mb-4">เขียนรีวิว</h3>
      <div className="p-4 lg:p-6 rounded-lg border border-gray-200 dark:border-primary">
        {!session ? (
          <div className="text-center py-8">
            <p className="text-gray-700 dark:text-gray-200 mb-4">กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว</p>
            <div className="flex flex-col items-center">
              <Button
                onClick={() => signIn("google", { callbackUrl: window.location.href })}
                className="flex items-center gap-3 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                เข้าสู่ระบบด้วย Google
              </Button>
            </div>
          </div>
        ) : (
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
            <div className="flex flex-row gap-4">
              <Button type="submit" disabled={isSubmitting} className="basis-1/2 cursor-pointer">
                {isSubmitting ? "กำลังส่ง..." : "ส่งรีวิว"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => signOut({ callbackUrl: window.location.href })}
                className="basis-1/2 cursor-pointer border-primary text-primary dark:text-primary-foreground"
              >
                ออกจากระบบ
              </Button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}