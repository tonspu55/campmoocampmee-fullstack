import { client } from "@/sanity/client";
import type { SanityDocument } from "next-sanity";
import Link from "next/link";
import GalleryWithInitialImage from "@/components/GalleryWithInitialImage";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { transformGalleryData } from "@/lib/videoUtils";
import type { GalleryItem } from "@/types/gallery";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const POST_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && slug.current == $slug][0]{
  ...,
  gallery[]{
    _type,
    asset->{
      _id,
      url
    },
    category,
    alt
  },
  videos[]{
    _type,
    url,
    platform,
    category,
    title
  }
}`;

const options = { next: { revalidate: 300 } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  return {
    title: `อัลบั้ม - ${post.title}`,
    description: `ดูอัลบั้มรูปภาพของ ${post.title}`,
  };
}

const GalleryPage = async ({ params }: PageProps) => {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  // ดึงข้อมูล gallery (รูปภาพ) และ videos แยกกัน
  const rawGalleryData = post.gallery || [];
  const rawVideosData = post.videos || [];

  // แปลงข้อมูลสำหรับ TabGallery (รวม gallery และ videos)
  const tabGalleryData = transformGalleryData(rawGalleryData, rawVideosData).filter(Boolean);

  return (
    <div className="container mx-auto  max-w-225 py-6 md:py-10  px-2">

      <div className="flex flex-row  gap-2 items-center">
        <Button asChild className="flex h-9 w-9 items-center  justify-center rounded-full cursor-pointer" variant="default">
          <Link href={`/land/${(await params).slug}`} >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <h1 className="text-lg lg:text-2xl font-bold ">{post.title}</h1>
      </div>
      <GalleryWithInitialImage dataGallery={tabGalleryData as GalleryItem[]} slug={(await params).slug} postTitle={post.title} />
    </div>
  );
};

export default GalleryPage;