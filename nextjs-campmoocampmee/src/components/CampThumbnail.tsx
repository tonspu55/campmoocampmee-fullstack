import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import { urlFor } from "@/sanity/client";
import { Skeleton } from "@/components/ui/skeleton";


interface CampCardProps {
  posts?: SanityDocument[];
  loading?: boolean;
  skeletonCount?: number;
}

// Skeleton component for loading state
function CampThumbnailSkeleton({ count, }: { count: number; }) {
  return (
    <>

      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square rounded-[20px] w-full" />
          {/* <div className="px-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div> */}
        </div>
      ))}

    </>
  );
}

export default function CampCard({
  posts = [],
  loading = false,
  skeletonCount = 8
}: CampCardProps) {
  // Show skeleton when loading or posts is empty/undefined
  if (loading) {
    return <CampThumbnailSkeleton count={skeletonCount} />;
  }


  return (
    <>
      {posts.filter(Boolean).map((post) => {
        const postImageUrl = post.thumbnail
          ? urlFor(post.thumbnail).width(550).height(550).url()
          : null;
        return (
          <Link href={`/land/${post.slug.current}`} key={post._id}>
            <div className="border-none p-0 flex flex-col gap-2">
              {postImageUrl ? (
                <Image
                  src={postImageUrl}
                  alt={post.title}
                  className="aspect-square rounded-[20px] w-full object-cover"
                  width={550}
                  height={550}
                />
              ) : (
                <div className="aspect-square rounded-[20px] w-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">ไม่มีรูปภาพ</span>
                </div>
              )}
              <div className="px-1">
                <h3 className="text-sm font-semibold line-clamp-1">{post.title}</h3>
                {post.otherBenefits?.priceOfStay && (
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    ฿{post.otherBenefits.priceOfStay} / คน / คืน
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </>
  );
}

// Export skeleton component for external use
export { CampThumbnailSkeleton };
