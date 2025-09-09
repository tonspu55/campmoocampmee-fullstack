import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import InfoAddress from "@/components/InfoAddress";
// import {
//   Card,
// } from "@/components/ui/card"

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
    <div className="">
      {showTitle && <h1 className="text-2xl font-bold mb-4">แคมป์ทั้งหมด</h1>}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
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
                    className="aspect-video rounded-xl w-full"
                    width={300}
                    height={300}
                  />
                )}
                <div className="px-1">
                  <h3 className="max-lg:text-sm text-md font-semibold line-clamp-1">{post.title}</h3>
                  <InfoAddress InfoAddress={post.address} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
