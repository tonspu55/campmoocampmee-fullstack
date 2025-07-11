import { client } from "@/sanity/client";
import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import ImageGallery from "@/components/ImageGallery";
import type { Metadata } from "next";


type PageProps = {
  params: Promise<{ slug: string }>;
};
interface GalleryItem {
  url: string | null;
  category: string | null;
}

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
    title: `ที่พัก - ${post.title}`,
    description: `รายละเอียดที่พัก ${post.title}`,
  };
}

export default async function PostPage({
  params,
}: PageProps) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  const galleryData: GalleryItem[] = post.gallery?.map((image: SanityImageSource & { category?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url();
    const category = image.category || null;
    return { url: imageUrl, category };
  });

  const ImageGalleryData = galleryData?.map((data) => data.url);

  return (
    <main className="container mx-auto max-w-6xl  mt-[70px]">


      {ImageGalleryData && <ImageGallery ImageGallery={ImageGalleryData} slug={(await params).slug} />}

      <h4 className="text-xl font-bold my-6">{post.title}</h4>
      <div className="prose">
        {Array.isArray(post.body) && <PortableText value={post.body} />}
      </div>
    </main>
  );
}