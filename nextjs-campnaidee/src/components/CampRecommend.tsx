import Link from "next/link";
import Image from "next/image";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import InfoAddress from "@/components/InfoAddress";
import {
  Card,
} from "@/components/ui/card"

interface CampRecommendProps {
  posts: SanityDocument[];
}

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

export default function CampRecommend({ posts }: CampRecommendProps) {
  return (
    <div className="container mx-auto max-w-6xl pt-6 lg:pt-10 px-2">
      <h1 className="text-2xl font-bold mb-4">แคมป์แนะนำ</h1>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-4">
        {posts.map((post) => {
          const postImageUrl = post.thumbnail
            ? urlFor(post.thumbnail)?.width(550).height(310).url()
            : null;
          return (


            <Link href={`/land/${post.slug.current}`} key={post._id}>
              <Card className="border-none rounded-b-md  p-0 shadow-md flex flex-col gap-2">
                {postImageUrl && (
                  <Image
                    src={postImageUrl}
                    alt={post.title}
                    className="aspect-video rounded-t-md w-full"
                    width={300}
                    height={250}
                  />
                )}
                <div className="px-2 pb-2">
                  <h3 className="max-lg:text-sm text-md font-semibold line-clamp-1">{post.title}</h3>
                  <InfoAddress InfoAddress={post.address} />
                </div>
              </Card>
            </Link>



          );
        })}
      </div>
    </div>
  );
}
