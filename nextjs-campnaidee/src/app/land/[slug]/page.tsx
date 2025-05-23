import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";
import GalleryImage from "@/components/GalleryImage";

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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  const galleryData: GalleryItem[] = post.gallery?.map((image: SanityImageSource & { category?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url();
    const category = image.category || null;
    return { url: imageUrl, category };
  });

  const galleryImages = galleryData?.map((data) => data.url);
  const galleryCategories = galleryData?.map((data) => data.category);

  return (
    <main className="container mx-auto max-w-6xl">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>

      {galleryImages && <GalleryImage galleryImages={galleryImages} />}

      {galleryCategories && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          <ul className="list-disc pl-5">
            {galleryCategories.map((category, index) => (
              <li key={index} className="text-gray-700">
                {category || "Uncategorized"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
      <div className="prose">
        {Array.isArray(post.body) && <PortableText value={post.body} />}

      </div>
    </main>
  );
}