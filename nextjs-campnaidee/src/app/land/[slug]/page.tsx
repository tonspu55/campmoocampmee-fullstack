import { client } from "@/sanity/client";
import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import ImageGallery from "@/components/ImageGallery";
import ContactSocialLink from "@/components/ContactSocialLink";
import type { Metadata } from "next";
import styles from "./style.module.css";
import ShareToSocial from "@/components/ShareToSocial";
import OtherBenefits from "@/components/OtherBenefits";


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
    title: `แคมป์ - ${post.title}`,
    description: `รายละเอียดแคมป์ ${post.title}`,
  };
}

export default async function PostPage({ params, }: PageProps) {
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

      <div className="flex flex-col md:flex-row gap-4 mt-6 md:mt-9 items-start">
        <div className="basis-1/1 md: max-md:px-2">
          <div className="flex flex-row gap-4 justify-between items-start mb-4 md:mb-6">
            <h2 className="text-2xl font-bold ">{post.title}</h2>
            <ShareToSocial title={post.title} slug={(await params).slug} />
          </div>
          <div className="text-description ml-[20px]">
            {Array.isArray(post.body) && <PortableText value={post.body} />}
          </div>
          <div className="my-8">
            <OtherBenefits otherBenefits={post.otherBenefits} />
          </div>

        </div>
        <div className={`border-primary basis-1/1 w-full md:basis-1/3 p-4 ${styles.contactInfo}`}>
          <ContactSocialLink socialContactLinks={post.socialContactLinks} />
        </div>
      </div>
    </main>
  );
}