import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";


interface CampRecommendProps {
  posts: SanityDocument[];
  showTitle?: boolean;
}

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function CampRecommend({ posts, showTitle = true }: CampRecommendProps) {
  return (
    <>
      {showTitle && <h1 className="text-2xl font-bold mb-4">แคมป์ทั้งหมด</h1>}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {posts.map((post) => {
          const postImageUrl = post.thumbnail
            ? urlFor(post.thumbnail)?.width(550).height(300).url()
            : null;
          return (


            <Link href={`/land/${post.slug.current}`} key={post._id}>
              <div className="border-none p-0  flex flex-col gap-2">
                {postImageUrl && (
                  <Image
                    src={postImageUrl}
                    alt={post.title}
                    className="aspect-video rounded-[20px] w-full h-[175px] lg:h-[235px] object-cover"
                    width={300}
                    height={300}
                  />
                )}
                <div className="px-1">
                  <h3 className="max-lg:text-sm text-md font-semibold line-clamp-1">{post.title}</h3>
                  {post.otherBenefits?.priceOfStay && (
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      หัวละ {post.otherBenefits.priceOfStay} บาท / คืน
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
