export const revalidate = 300;

import { readClient as client, urlFor } from '@/sanity/client';
import { PortableText, type SanityDocument } from 'next-sanity';
import { notFound } from 'next/navigation';
import MobileParallaxGallery from '@/components/MobileParallaxGallery';
import ContactSocialLink from '@/components/ContactSocialLink';
import type { Metadata } from 'next';
import styles from './style.module.css';
import ShareToSocial from '@/components/ShareToSocial';
import HeartButton from '@/components/HeartButton';
import OtherBenefits from '@/components/OtherBenefits';
import InfoAddress from '@/components/InfoAddress';
import NavigationMobile from '@/components/NavigationMobile';
import ExpandableContent from '@/components/ExpandableContent';
import ReviewSection from '@/components/ReviewSection';
import JsonLd from '@/components/JsonLd';
import CampThumbnailCarousel from '@/components/CampThumbnailCarousel';
import { hasImageAsset, type SanityImageItem } from '@/types/gallery';

const SITE_URL = 'https://www.campmoocampmee.com';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const POST_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && slug.current == $slug][0]{
  ...,
  gallery[]{
    _key,
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

// query เบาสำหรับ generateMetadata — ไม่ต้องดึง body/gallery ทั้งก้อน
const POST_METADATA_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && slug.current == $slug][0]{
  title,
  address,
  thumbnail
}`;

const REVIEWS_QUERY = `*[_type == "review" && post._ref == $postId && status == "approved"]{rating}`;

// จำกัดผลลัพธ์ตั้งแต่ระดับ query แล้วค่อยสุ่มเลือกจาก pool นี้
const RELATED_POSTS_POOL_SIZE = 20;
const RELATED_POSTS_LIMIT = 7;

const RELATED_POSTS_QUERY = `*[
  _type == "post"
  && !(_id in path("drafts.**"))
  && defined(slug.current)
  && address.province == $province
  && _id != $currentPostId
] | order(_createdAt desc) [0...${RELATED_POSTS_POOL_SIZE}]{
  _id,
  title,
  slug,
  thumbnail,
  otherBenefits
}`;

/** Fisher–Yates shuffle (คืน array ใหม่ ไม่แก้ของเดิม) */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const options = { next: { revalidate: 300 } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument | null>(
    POST_METADATA_QUERY,
    { slug },
    options,
  );

  if (!post) {
    return {
      title: 'ไม่พบลานกางเต็นท์ที่ค้นหา',
      robots: { index: false, follow: false },
    };
  }

  const pageUrl = `${SITE_URL}/land/${slug}`;
  const title = `${post.title} - ลานกางเต็นท์จังหวัด${post.address?.province}`;
  const description = `${post.title} ตั้งอยู่ที่ ${post.address?.province} ${post.address?.district} ${post.address?.subdistrict}`;

  const thumbnailImage = post.thumbnail
    ? urlFor(post.thumbnail).width(1200).height(1200).url()
    : null;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
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
      card: 'summary_large_image',
      title,
      description,
      images: thumbnailImage ? [thumbnailImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await client.fetch<SanityDocument | null>(
    POST_QUERY,
    { slug },
    options,
  );

  if (!post) notFound();

  // reviews (สำหรับ AggregateRating) กับ related posts ไม่ขึ้นต่อกัน → ยิงพร้อมกัน
  const [reviews, relatedPostsRaw] = await Promise.all([
    client.fetch<{ rating: number }[]>(
      REVIEWS_QUERY,
      { postId: post._id },
      options,
    ),
    client.fetch<SanityDocument[]>(
      RELATED_POSTS_QUERY,
      { province: post.address?.province, currentPostId: post._id },
      options,
    ),
  ]);

  const relatedPosts = shuffle(relatedPostsRaw).slice(0, RELATED_POSTS_LIMIT);

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
    .filter(hasImageAsset)
    .map((item, index) => ({
      key: item._key ?? `image-${index}`,
      url: urlFor(item).width(1200).height(1200).url(),
      alt: item.alt || null,
      title: post.title,
    }));

  const pageUrl = `${SITE_URL}/land/${slug}`;

  const campgroundSchema = {
    '@context': 'https://schema.org',
    '@type': 'Campground',
    name: post.title,
    description:
      `${post.title} ตั้งอยู่ที่ ${post.address?.subdistrict ?? ''} ${post.address?.district ?? ''} จังหวัด${post.address?.province ?? ''}`.trim(),
    url: pageUrl,
    image: ImageGalleryData.slice(0, 5).map((img) => img.url),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [post.address?.subdistrict, post.address?.district]
        .filter(Boolean)
        .join(' '),
      addressLocality: post.address?.district,
      addressRegion: post.address?.province,
      addressCountry: 'TH',
    },
    ...(post.location?.lat && post.location?.lng
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: post.location.lat,
            longitude: post.location.lng,
          },
        }
      : {}),
    ...(totalReviews > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
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
            '@type': 'LocationFeatureSpecification',
            name: benefit,
            value: true,
          })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'หน้าแรก',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `ลานกางเต็นท์จังหวัด${post.address?.province ?? ''}`,
        item: `${SITE_URL}/search?province=${encodeURIComponent(post.address?.province ?? '')}`,
      },
      {
        '@type': 'ListItem',
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
      {/* ImageGallery ชุดเดียวทุก breakpoint (mobile ตรึงแบบ parallax, desktop static) */}
      <MobileParallaxGallery images={ImageGalleryData} slug={slug} />

      {/* Content section - scrolls over ImageGallery on mobile */}
      <div className="relative z-10 bg-background md:bg-transparent rounded-t-2xl md:rounded-none -mt-4 md:mt-0 pt-4 md:pt-0">
        <div className="flex flex-col lg:flex-row gap-4 mt-0 md:mt-4 lg:mt-6 items-start">
          <div className="basis-1/1 lg:px-2 lg:pr-0 lg:pl-2 w-full">
            <div className="flex flex-row gap-4 justify-between items-start mb-4  max-lg:px-2">
              <div className="flex flex-col">
                <h1 className="text-xl md:text-2xl font-semibold ">
                  {post.title}
                </h1>
                <InfoAddress InfoAddress={post.address} />
              </div>
              <div className="flex flex-row gap-2 items-center">
                <HeartButton postId={post._id} variant="button" />
                <ShareToSocial title={post.title} slug={slug} />
              </div>
            </div>
            <OtherBenefits otherBenefits={post.otherBenefits} />
            <div className="max-lg:px-2">
              <ExpandableContent maxHeight={200}>
                {Array.isArray(post.body) && <PortableText value={post.body} />}
              </ExpandableContent>
            </div>
            {/* mobile: ช่องทางติดต่อโชว์ตรงนี้ (desktop ใช้กล่อง sticky ฝั่งขวา) */}
            <div className="lg:hidden mt-6">
              <ContactSocialLink socialContactLinks={post.socialContactLinks} />
            </div>
            {/* แผนที่เรนเดอร์ชุดเดียว — mobile อยู่ใต้ช่องทางติดต่อ, desktop อยู่ใต้เนื้อหา */}
            {post.socialContactLinks?.googleMap && (
              <div className="flex flex-col mt-4 lg:mt-6">
                <iframe
                  title={`แผนที่ ${post.title}`}
                  className="rounded-lg w-full"
                  src={post.socialContactLinks.googleMap}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
            <ReviewSection postId={post._id} />
          </div>
          <div className="px-2 max-lg:w-full basis-1/1 lg:pl-0 lg:basis-1/3 max-lg:pt-4 max-lg:hidden sticky top-19">
            <div
              className={`p-4 ${styles.contactInfo} dark:border-primary dark:border`}
            >
              <ContactSocialLink socialContactLinks={post.socialContactLinks} />
            </div>
          </div>
        </div>
      </div>
      {/* relate posts */}
      {relatedPosts.length > 0 && (
        <section className="mt-6 ">
          <h3 className="text-lg md:text-xl font-semibold px-2 mb-4">
            ลานกางเต็นท์อื่นๆในจังหวัด{post.address?.province}
          </h3>
          <CampThumbnailCarousel posts={relatedPosts} />
        </section>
      )}

      <div className="end-page-detection lg:hidden"></div>
      <NavigationMobile socialContactLinks={post.socialContactLinks} />
    </main>
  );
}
