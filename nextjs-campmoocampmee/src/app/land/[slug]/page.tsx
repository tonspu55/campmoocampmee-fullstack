import { readClient as client } from "@/sanity/client";
import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import ImageGallery from "@/components/ImageGallery";
import MobileParallaxGallery from "@/components/MobileParallaxGallery";
import ContactSocialLink from "@/components/ContactSocialLink";
import type { Metadata } from "next";
import styles from "./style.module.css";
import ShareToSocial from "@/components/ShareToSocial";
import OtherBenefits from "@/components/OtherBenefits";
import InfoAddress from "@/components/InfoAddress";
import NavigationMobile from "@/components/NavigationMobile";
import ExpandableContent from "@/components/ExpandableContent";
import ReviewSection from "@/components/ReviewSection";
import JsonLd from "@/components/JsonLd";

const SITE_URL = "https://www.campmoocampmee.com";

type PageProps = {
  params: Promise<{ slug: string }>;
};

interface SanityImageItem {
  _type: "image";
  asset?: { _id: string; url: string };
  category?: string;
  alt?: string;
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

const REVIEWS_QUERY = `*[_type == "review" && post._ref == $postId && status == "approved"]{rating}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 300 } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await client.fetch<SanityDocument>(
    POST_QUERY,
    await params,
    options,
  );

  const thumbnailImage = post.thumbnail
    ? urlFor(post.thumbnail)?.width(1200).height(1200).url() || null
    : null;

  return {
    title: `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`,
    description: `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`,
    openGraph: {
      title: `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`,
      description: `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`,
      images: thumbnailImage
        ? [
            {
              url: thumbnailImage,
              width: 1200,
              height: 1200,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`,
      description: `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`,
      images: thumbnailImage ? [thumbnailImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument>(
    POST_QUERY,
    { slug },
    options,
  );

  // ดึง reviews สำหรับ AggregateRating
  const reviews = await client.fetch<{ rating: number }[]>(
    REVIEWS_QUERY,
    { postId: post._id },
    options,
  );
  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? parseFloat(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1),
        )
      : 0;

  // ดึงข้อมูล gallery (รูปภาพ) และ videos แยกกัน
  const rawGalleryData: SanityImageItem[] = post.gallery || [];

  // สำหรับ ImageGallery (เฉพาะรูปภาพ)
  const ImageGalleryData = rawGalleryData
    .filter(
      (item): item is SanityImageItem & { asset: { url: string } } =>
        item._type === "image" && !!item.asset?.url,
    )
    .map((item) => {
      const imageUrl = urlFor(item)?.width(1200).height(1200).url();
      return {
        url: imageUrl || "",
        alt: item.alt || null,
      };
    })
    .filter((item) => item.url);

  const pageUrl = `${SITE_URL}/land/${slug}`;

  const campgroundSchema = {
    "@context": "https://schema.org",
    "@type": "Campground",
    name: post.title,
    description:
      `${post.title} ตั้งอยู่ที่ ${post.address?.subdistrict ?? ""} ${post.address?.district ?? ""} จังหวัด${post.address?.province ?? ""}`.trim(),
    url: pageUrl,
    image: ImageGalleryData.slice(0, 5).map((img) => img.url),
    address: {
      "@type": "PostalAddress",
      streetAddress: [post.address?.subdistrict, post.address?.district]
        .filter(Boolean)
        .join(" "),
      addressLocality: post.address?.district,
      addressRegion: post.address?.province,
      addressCountry: "TH",
    },
    ...(post.location?.lat && post.location?.lng
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: post.location.lat,
            longitude: post.location.lng,
          },
        }
      : {}),
    ...(totalReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount: totalReviews,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    ...(post.otherBenefits?.length
      ? {
          amenityFeature: post.otherBenefits.map((benefit: string) => ({
            "@type": "LocationFeatureSpecification",
            name: benefit,
            value: true,
          })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "หน้าแรก",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `ลานกางเต็นท์จังหวัด${post.address?.province ?? ""}`,
        item: `${SITE_URL}/search?province=${encodeURIComponent(post.address?.province ?? "")}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  return (
    <main className="container mx-auto max-w-6xl mt-15 pb-6 lg:pb-10">
      <JsonLd data={campgroundSchema} />
      <JsonLd data={breadcrumbSchema} />
      {/* Mobile: Fixed ImageGallery with parallax effect */}
      {ImageGalleryData && (
        <MobileParallaxGallery ImageGallery={ImageGalleryData} slug={slug} />
      )}

      {/* Desktop: Normal ImageGallery */}
      <div className="hidden md:block">
        {ImageGalleryData && (
          <ImageGallery ImageGallery={ImageGalleryData} slug={slug} />
        )}
      </div>

      {/* Content section - scrolls over ImageGallery on mobile */}
      <div className="relative z-10 bg-background md:bg-transparent rounded-t-2xl md:rounded-none -mt-4 md:mt-0 pt-4 md:pt-0">
        <div className="flex flex-col lg:flex-row gap-4 mt-0 md:mt-4 lg:mt-6 items-start">
          <div className="basis-1/1 px-2 lg:pr-0 lg:pl-2 w-full">
            <div className="flex flex-row gap-4 justify-between items-start mb-4 lg:mb-6">
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-semibold ">
                  {post.title}
                </h1>
                <InfoAddress InfoAddress={post.address} />
              </div>
              <ShareToSocial title={post.title} slug={slug} />
            </div>
            <OtherBenefits otherBenefits={post.otherBenefits} />
            <div className="">
              <ExpandableContent maxHeight={200}>
                {Array.isArray(post.body) && <PortableText value={post.body} />}
              </ExpandableContent>
            </div>

            <div className={`lg:hidden mt-4`}>
              <ContactSocialLink socialContactLinks={post.socialContactLinks} />
            </div>
            <ReviewSection postId={post._id} />
          </div>
          <div className="px-2 max-lg:w-full basis-1/1 lg:pl-0 lg:basis-1/3 max-lg:pt-4 max-lg:hidden sticky top-[76px]">
            <div
              className={`p-4 ${styles.contactInfo} dark:border-primary dark:border`}
            >
              <ContactSocialLink socialContactLinks={post.socialContactLinks} />
            </div>
          </div>
        </div>
      </div>
      <div className="end-page-detection lg:hidden"></div>
      <NavigationMobile socialContactLinks={post.socialContactLinks} />
    </main>
  );
}
