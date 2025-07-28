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
import NavigationMobile from "@/components/NavigationMobile";
import ExpandableContent from "@/components/ExpandableContent";



type PageProps = {
  params: Promise<{ slug: string }>;
};
interface GalleryItem {
  url: string | null;
  category: string | null;
  alt: string | null;
}

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

  const thumbnailImage = post.thumbnail
    ? urlFor(post.thumbnail)?.width(1200).height(1200).url() || null
    : null;


  return {
    title: `แคมป์ - ${post.title}`,
    description: `รายละเอียด ${post.title}`,
    openGraph: {
      title: `แคมป์ - ${post.title}`,
      description: `รายละเอียด ${post.title}`,
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

  const galleryData: GalleryItem[] = post.gallery?.map((image: SanityImageSource & { category?: string; alt?: string }) => {
    const imageUrl = urlFor(image)?.width(1200).height(1200).url() || null;
    const category = image.category || null;
    const alt = image.alt || null;
    return { url: imageUrl, category, alt };
  }) || [];

  const ImageGalleryData = galleryData
    .map(item => ({
      url: item.url!,
      alt: item.alt
    }));


  return (
    <main className="container mx-auto max-w-6xl  mt-[60px] pb-6 lg:pb-10">
      {ImageGalleryData && <ImageGallery ImageGallery={ImageGalleryData} slug={(await params).slug} />}
      <div className="flex flex-col lg:flex-row gap-4 mt-4 lg:mt-6 items-start">
        <div className="basis-1/1 px-2 lg:pr-0 lg:pl-2 w-full">
          <div className="flex flex-row gap-4 justify-between items-start mb-4 lg:mb-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold ">{post.title}</h2>
              <InfoAddress InfoAddress={post.address} />
            </div>
            <ShareToSocial title={post.title} slug={(await params).slug} />
          </div>
          <div className="text-description max-md:text-sm">
            <ExpandableContent maxHeight={200}>
              {Array.isArray(post.body) && <PortableText value={post.body} />}
            </ExpandableContent>
          </div>
          <Separator className="my-4 lg:hidden" />
          <div className={`lg:hidden mt-4 `}>
            <ContactSocialLink socialContactLinks={post.socialContactLinks} />
          </div>
          <Separator className="my-4 lg:my-8" />
          <OtherBenefits otherBenefits={post.otherBenefits} />
        </div>
        <div className="px-2 max-lg:w-full basis-1/1 lg:pl-0  lg:basis-1/3 max-lg:pt-4 max-lg:hidden">
          <div className={`p-4 ${styles.contactInfo} dark:border-primary dark:border`}>
            <ContactSocialLink socialContactLinks={post.socialContactLinks} />
          </div>
        </div>
      </div>
      <div className="end-page-detection lg:hidden"></div>
      <NavigationMobile socialContactLinks={post.socialContactLinks} />
    </main>
  );
}