"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import { urlFor } from "@/sanity/client";
import HeartButton from "@/components/HeartButton";

export default function CampThumbnailCarousel({
  posts,
}: {
  posts: SanityDocument[];
}) {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  return (
    <div ref={emblaRef} className="overflow-hidden">
      <div className="flex gap-2 px-2">
        {posts.filter(Boolean).map((post) => {
          const postImageUrl = post.thumbnail
            ? urlFor(post.thumbnail).width(354).height(354).url()
            : null;
          return (
            <div
              key={post._id}
              className="relative flex-none w-44.25 flex flex-col gap-2"
            >
              <HeartButton postId={post._id} />
              <Link
                href={`/land/${post.slug.current}`}
                className="flex flex-col gap-2"
              >
                <div className="rounded-[20px] overflow-hidden w-44.25 aspect-square">
                  {postImageUrl ? (
                    <Image
                      src={postImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      width={177}
                      height={177}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">
                        ไม่มีรูปภาพ
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-1">
                  <h3 className="text-sm font-semibold line-clamp-1">
                    {post.title}
                  </h3>
                  {post.otherBenefits?.priceOfStay && (
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      ฿{post.otherBenefits.priceOfStay} / คน / คืน
                    </p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
