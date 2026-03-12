"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/lib/wishlist-store";
import UserDialog from "@/components/UserDialog";

interface HeartButtonProps {
  postId: string;
  variant?: "overlay" | "button";
}

export default function HeartButton({
  postId,
  variant = "overlay",
}: HeartButtonProps) {
  const { data: session } = useSession();
  const [loginOpen, setLoginOpen] = useState(false);
  const isFavorite = useWishlistStore((state) => state.isFavorite(postId));
  const toggleFavorite = useWishlistStore((state) => state.toggleFavorite);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      setLoginOpen(true);
      return;
    }

    toggleFavorite(postId);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          variant === "button"
            ? "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            : "absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        }
        aria-label={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
      >
        <Heart
          className={
            variant === "button"
              ? `h-5 w-5 transition-colors ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "fill-none text-primary-foreground"
                }`
              : `h-6 w-6 drop-shadow-md transition-colors ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "fill-black/40 text-white"
                }`
          }
          strokeWidth={2}
        />
      </button>
      <UserDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
