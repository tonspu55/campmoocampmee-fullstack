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
import { Separator } from "@/components/ui/separator"
import InfoAddress from "@/components/InfoAddress";



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

  // Get first gallery image for thumbnail
  const galleryData: GalleryItem[] = post.gallery?.map((image: SanityImageSource & { category?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url();
    const category = image.category || null;
    return { url: imageUrl, category };
  });

  const thumbnailImage = galleryData?.[0]?.url;


  return {
    title: `แคมป์ - ${post.title}`,
    description: `รายละเอียดแคมป์ ${post.title}`,
    openGraph: {
      title: `แคมป์ - ${post.title}`,
      description: `รายละเอียดแคมป์ ${post.title}`,
      images: thumbnailImage ? [
        {
          url: thumbnailImage,
          width: 1200,
          height: 1200,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `แคมป์ - ${post.title}`,
      description: `รายละเอียดแคมป์ ${post.title}`,
      images: thumbnailImage ? [thumbnailImage] : undefined,
    },
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
    <main className="container mx-auto max-w-6xl  mt-[70px] pb-6 lg:pb-10">
      {ImageGalleryData && <ImageGallery ImageGallery={ImageGalleryData} slug={(await params).slug} />}

      <div className="flex flex-col lg:flex-row gap-4 mt-6 lg:mt-8 items-start">
        <div className="basis-1/1 px-2 lg:pr-0 lg:pl-2">
          <div className="flex flex-row gap-4 justify-between items-start mb-4 lg:mb-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold ">{post.title}</h2>
              <InfoAddress InfoAddress={post.address} />
            </div>
            <ShareToSocial title={post.title} slug={(await params).slug} />
          </div>
          <div className="text-description ml-[20px] max-md:text-sm">
            {Array.isArray(post.body) && <PortableText value={post.body} />}
          </div>
          <div className={`lg:hidden mt-4 p-4 ${styles.contactInfo} dark:border-primary dark:border`}>
            <ContactSocialLink socialContactLinks={post.socialContactLinks} />
          </div>
          <Separator className="mt-6 mb-4 lg:my-8" />
          <OtherBenefits otherBenefits={post.otherBenefits} />
        </div>
        <div className="px-2 max-lg:w-full basis-1/1 lg:pl-0  lg:basis-1/3 max-lg:pt-4 max-lg:hidden">
          <div className={`p-4 ${styles.contactInfo} dark:border-primary dark:border`}>
            <ContactSocialLink socialContactLinks={post.socialContactLinks} />
          </div>
        </div>

      </div>
    </main>
  );
}