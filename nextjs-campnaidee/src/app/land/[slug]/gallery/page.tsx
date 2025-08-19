import { client } from "@/sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import type { SanityDocument } from "next-sanity";
import Link from "next/link";
import GalleryWithInitialImage from "@/components/GalleryWithInitialImage";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ItemGallery {
  url: string | null;
  category: string | null;
  alt: string | null;
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  ...,
  gallery[]{
    ...,
    asset,
    category,
    alt
  }
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  return {
    title: `อัลบั้ม - ${post.title}`,
    description: `ดูอัลบั้มรูปภาพของ ${post.title}`,
  };
}

const GalleryPage = async ({ params }: PageProps) => {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  const dataGallery: ItemGallery[] = post.gallery?.map((image: SanityImageSource & { category?: string; alt?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url();
    const category = image.category || null;
    const alt = image.alt || null;
    return { url: imageUrl, category, alt };
  }) || [];

  return (
    <div className="container mx-auto  max-w-[900px] py-6 md:py-10  px-2">

      <div className="flex flex-row  gap-2 items-center">
        <Button asChild className="flex h-9 w-9 items-center  justify-center rounded-full cursor-pointer" variant="default">
          <Link href={`/land/${(await params).slug}`} >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <h1 className="text-lg lg:text-2xl font-bold ">{post.title}</h1>
      </div>





      <GalleryWithInitialImage dataGallery={dataGallery} />
    </div>
  );
};

export default GalleryPage;