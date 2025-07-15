import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { SanityDocument } from "next-sanity";
import Link from "next/link";
import TabGallery from "@/components/TabGallery";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ItemGallery {
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

  const dataGallery: ItemGallery[] = post.gallery?.map((image: SanityImageSource & { category?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url();
    const category = image.category || null;
    return { url: imageUrl, category };
  }) || [];

  return (
    <div className="container mx-auto  max-w-[900px] pb-8 md:pb-12  mt-[90px] max-md:px-2">


      <Button asChild className="flex h-9 w-9 items-center  justify-center rounded-full cursor-pointer" variant="default">
        <Link href={`/land/${(await params).slug}`} className="mb-6">
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </Button>


      <h1 className="text-2xl font-bold mb-6">แกลลอรี่ - {post.title}</h1>

      <TabGallery dataGallery={dataGallery} />
    </div>
  );
};

export default GalleryPage;