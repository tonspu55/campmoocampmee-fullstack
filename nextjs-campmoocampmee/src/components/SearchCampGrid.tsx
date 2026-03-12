"use client";

import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { readClient as client } from "@/sanity/client";
import { Skeleton } from "@/components/ui/skeleton";
import HeartButton from "@/components/HeartButton";

interface SearchCampGridProps {
  posts: SanityDocument[];
}

// สร้าง URL สำหรับรูปภาพจาก Sanity
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Skeleton component for loading state
export function SearchCampGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-4/3 rounded-xl w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SearchCampGrid({ posts }: SearchCampGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
      {posts.map((post) => {
        const postImageUrl = post.thumbnail
          ? urlFor(post.thumbnail)?.width(600).height(450).url()
          : null;

        return (
          <div key={post._id} className="relative group">
            <HeartButton postId={post._id} />
            <Link
              href={`/land/${post.slug.current}`}
              className="block"
            >
            <div className="flex flex-col gap-2">
              {/* Image with carousel dots overlay */}
              <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-gray-100">
                {postImageUrl ? (
                  <Image
                    src={postImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">ไม่มีรูปภาพ</span>
                  </div>
                )}

                {/* Carousel dots placeholder (like Airbnb) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {[0, 1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="px-0.5">
                {/* Title and location */}
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-[15px] line-clamp-1 text-gray-900 dark:text-white">
                    {post.title}
                  </h3>
                </div>

                {/* Province */}
                {post.address?.province && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {post.address.district && `${post.address.district}, `}
                    {post.address.province}
                  </p>
                )}

                {/* Price */}
                {post.otherBenefits?.priceOfStay && (
                  <p className="text-[15px] mt-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ฿{post.otherBenefits.priceOfStay}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400"> / คน / คืน</span>
                  </p>
                )}
              </div>
            </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
