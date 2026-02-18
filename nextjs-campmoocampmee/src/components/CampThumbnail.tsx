import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { Skeleton } from "@/components/ui/skeleton";


interface CampCardProps {
  posts?: SanityDocument[];
  loading?: boolean;
  skeletonCount?: number;
}
// สร้าง URL สำหรับรูปภาพจาก Sanity
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

// Skeleton component for loading state
function CampThumbnailSkeleton({ count, }: { count: number; }) {
  return (
    <>

      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-video rounded-[20px] w-full h-43.75 lg:h-58.75" />
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
        if (!post) return null;
        const postImageUrl = post.thumbnail
          ? urlFor(post.thumbnail)?.width(550).height(300).url()
          : null;
        return (
          <Link href={`/land/${post.slug.current}`} key={post._id}>
            <div className="border-none p-0 flex flex-col gap-2">
              {postImageUrl ? (
                <Image
                  src={postImageUrl}
                  alt={post.title}
                  className="aspect-video rounded-[20px] w-full h-43.75 lg:h-58.75 object-cover"
                  width={300}
                  height={300}
                />
              ) : (
                <div className="aspect-video rounded-[20px] w-full h-43.75 lg:h-58.75 bg-muted flex items-center justify-center">
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
