import { readClient as client } from "@/sanity/client";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TabGallery from "@/components/TabGallery";
import { transformGalleryData } from "@/lib/videoUtils";
import type { SanityImageItem, SanityVideoItem } from "@/types/gallery";

type PageProps = {
  params: Promise<{ slug: string }>;
};

type GalleryPost = {
  title?: string;
  // โพสต์ที่ยังไม่มี field เหล่านี้ GROQ คืน `null` ไม่ใช่ `undefined`
  gallery?: SanityImageItem[] | null;
  videos?: SanityVideoItem[] | null;
};

// ดึงเฉพาะ field ที่หน้านี้ใช้ — ไม่ต้องลาก body/benefits/contact มาด้วย
const POST_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && slug.current == $slug][0]{
  title,
  gallery[]{
    _key,
    _type,
    asset->{
      _id,
      url
    },
    category,
    alt
  },
  videos[]{
    _key,
    _type,
    url,
    platform,
    category,
    title
  }
}`;

// ให้เท่ากับหน้า detail เพื่อไม่ให้รูปที่เพิ่มใหม่ขึ้นคนละเวลากัน
const options = { next: { revalidate: 300 } };

const getPost = (slug: string) =>
  client.fetch<GalleryPost | null>(POST_QUERY, { slug }, options);

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "ไม่พบอัลบั้มรูปภาพ" };
  }

  return {
    title: `อัลบั้ม - ${post.title}`,
    description: `ดูอัลบั้มรูปภาพของ ${post.title}`,
  };
}

const GalleryPage = async ({ params }: PageProps) => {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const postTitle = post.title ?? "อัลบั้มรูปภาพ";
  const dataGallery = transformGalleryData(post.gallery, post.videos);

  return (
    <div className="container mx-auto max-w-225 px-2 py-6 md:py-10">
      <div className="flex flex-row items-center gap-2">
        <Button
          asChild
          className="flex h-9 w-9 items-center justify-center rounded-full"
          variant="default"
        >
          <Link href={`/land/${slug}`} aria-label="กลับไปหน้าที่พัก">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold lg:text-2xl">{postTitle}</h1>
      </div>
      <TabGallery dataGallery={dataGallery} slug={slug} postTitle={postTitle} />
    </div>
  );
};

export default GalleryPage;
