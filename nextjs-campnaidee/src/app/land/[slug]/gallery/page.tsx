import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { SanityDocument } from "next-sanity";
import Link from "next/link";
import GalleryTabs from "@/components/GalleryTabs";
import type { Metadata } from "next";

interface GalleryItem {
  url: string | null;
  category: string | null;
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  return {
    title: `แกลลอรี่ - ${post.title}`,
    description: `ดูแกลลอรี่รูปภาพของ ${post.title}`,
  };
}

const GalleryPage = async ({ params }: PageProps) => {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  const galleryData: GalleryItem[] = post.gallery?.map((image: SanityImageSource & { category?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url();
    const category = image.category || null;
    return { url: imageUrl, category };
  }) || [];

  return (
    <div className="container mx-auto  max-w-[900px] max-lg:p-2">
      <Link href={`/land/${(await params).slug}`} className="hover:underline mb-4 inline-block">
        ← Back to post
      </Link>

      <h1 className="text-4xl font-bold mb-8">แกลลอรี่ - {post.title}</h1>

      <GalleryTabs galleryData={galleryData} />
    </div>
  );
};

export default GalleryPage;