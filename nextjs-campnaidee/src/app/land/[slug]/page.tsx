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
import InfoAddress from "@/components/InfoAddress";
import NavigationMobile from "@/components/NavigationMobile";
import ExpandableContent from "@/components/ExpandableContent";
import ReviewSection from "@/components/ReviewSection";


type PageProps = {
  params: Promise<{ slug: string }>;
};

interface SanityImageItem {
  _type: 'image';
  asset?: { _id: string; url: string };
  category?: string;
  alt?: string;
}

interface SanityVideoItem {
  _type: 'videoUrl';
  url?: string;
  platform?: string;
  title?: string;
  category?: string;
}

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

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 300 } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  const thumbnailImage = post.thumbnail
    ? urlFor(post.thumbnail)?.width(1200).height(1200).url() || null
    : null;

  return {
    title: `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`,
    description: `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`,
    openGraph: {
      title: `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`,
      description: `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`,
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
      title: `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`,
      description: `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`,
      images: thumbnailImage ? [thumbnailImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);

  // ดึงข้อมูล gallery (รูปภาพ) และ videos แยกกัน
  const rawGalleryData: SanityImageItem[] = post.gallery || [];
  const rawVideosData: SanityVideoItem[] = post.videos || [];

  // สำหรับ ImageGallery (เฉพาะรูปภาพ)
  const ImageGalleryData = rawGalleryData
    .filter((item): item is SanityImageItem & { asset: { url: string } } =>
      item._type === 'image' && !!item.asset?.url
    )
    .map(item => {
      const imageUrl = urlFor(item)?.width(1200).height(1200).url();
      return {
        url: imageUrl || '',
        alt: item.alt || null
      };
    })
    .filter(item => item.url);

  // console.log('Raw Gallery Data:', rawGalleryData);
  // console.log('Tab Gallery Data:', tabGalleryData);
  // console.log('Image Gallery Data:', ImageGalleryData);

  return (
    <main className="container mx-auto max-w-6xl  mt-15 pb-6 lg:pb-10">
      {ImageGalleryData && <ImageGallery ImageGallery={ImageGalleryData} slug={(await params).slug} />}
      <div className="flex flex-col lg:flex-row gap-4 mt-4 lg:mt-6 items-start">
        <div className="basis-1/1 px-2 lg:pr-0 lg:pl-2 w-full">
          <div className="flex flex-row gap-4 justify-between items-start mb-4 lg:mb-6">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold ">{post.title}</h1>
              <InfoAddress InfoAddress={post.address} />
            </div>
            <ShareToSocial title={post.title} slug={(await params).slug} />
          </div>
          <OtherBenefits otherBenefits={post.otherBenefits} />
          <div className="text-description max-md:text-sm">
            <ExpandableContent maxHeight={200}>
              {Array.isArray(post.body) && <PortableText value={post.body} />}
            </ExpandableContent>
          </div>

          <div className={`lg:hidden mt-4 `}>
            <ContactSocialLink socialContactLinks={post.socialContactLinks} />
          </div>
        </div>
        <div className="px-2 max-lg:w-full basis-1/1 lg:pl-0  lg:basis-1/3 max-lg:pt-4 max-lg:hidden">
          <div className={`p-4 ${styles.contactInfo} dark:border-primary dark:border`}>
            <ContactSocialLink socialContactLinks={post.socialContactLinks} />
          </div>
        </div>
      </div>
      <ReviewSection postId={post._id} />
      <div className="end-page-detection lg:hidden"></div>
      <NavigationMobile socialContactLinks={post.socialContactLinks} />
    </main>
  );
}
