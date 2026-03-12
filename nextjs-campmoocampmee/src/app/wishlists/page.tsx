"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import { Heart } from "lucide-react";
import CampCard, { CampThumbnailSkeleton } from "@/components/CampThumbnail";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function WishlistsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<SanityDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated") {
      fetchWishlist();
    }
  }, [status, router]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist?full=true", {
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="max-lg:pb-6 max-lg:pt-12 lg:py-10">
        <div className="container mx-auto px-2 max-w-6xl pt-6 lg:pt-10">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">หน้าหลัก</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>รายการโปรด</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold mb-4">รายการโปรด</h1>
          <div className="grid grid-cols-2 lg:grid-cols-4  gap-2 md:gap-4">
            <CampThumbnailSkeleton count={8} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-lg:pb-6 max-lg:pt-12 lg:py-10">
      <div className="container mx-auto px-2 max-w-6xl pt-6 lg:pt-10">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">หน้าหลัก</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>รายการโปรด</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <h1 className="text-2xl font-bold mb-4">รายการโปรด</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4  gap-2 md:gap-4">
            <CampThumbnailSkeleton count={8} />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">
              ยังไม่มีรายการโปรด
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              กดปุ่มหัวใจบนลานกางเต็นท์ที่ชอบเพื่อบันทึกไว้ที่นี่
            </p>
            <Link
              href="/"
              className="text-sm font-medium text-primary hover:underline"
            >
              กลับไปหน้าหลัก
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4  gap-2 md:gap-4">
            <CampCard posts={posts} />
          </div>
        )}
      </div>
    </main>
  );
}
