import { Suspense } from "react";
import { type SanityDocument } from "next-sanity";
import { readClient as client } from "@/sanity/client";
import HeroBanner from "@/components/HeroBanner";
import CampThumbnail, {
  CampThumbnailSkeleton,
} from "@/components/CampThumbnail";
import CampThumbnailCarousel from "@/components/CampThumbnailCarousel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { REGIONS } from "@/lib/regions";

const AVAILABLE_TAGS_QUERY = `array::unique(*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)].tags[])`;

const POSTS_QUERY = `*[
  _type == "post"
  && !(_id in path("drafts.**"))
  && defined(slug.current)
  && "recommend" in tags
]| order(publishedAt desc)[]{_id, title, address, thumbnail, slug, tags, otherBenefits}`;

// Set revalidation time for ISR
const options = { next: { revalidate: 3600 } }; // Revalidate every hour (3600 seconds)

// ฟังก์ชันสำหรับสลับที่รายการแบบสุ่มโดยใช้ seed
function shufflePosts(array: SanityDocument[], seed: number) {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let randomIndex;

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  let seedValue = seed;
  while (currentIndex !== 0) {
    seedValue = seedValue * 1103515245 + 12345;
    randomIndex = Math.floor(seededRandom(seedValue) * currentIndex);
    currentIndex--;

    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
}

function CampPostsDisplay({ posts }: { posts: SanityDocument[] }) {
  return (
    <>
      {/* Mobile: Carousel */}
      <div className="xl:hidden -mx-2">
        <CampThumbnailCarousel posts={posts} />
      </div>
      {/* Desktop: Grid */}
      <div className="hidden xl:grid xl:grid-cols-7 gap-2 xl:gap-3">
        <CampThumbnail posts={posts} />
      </div>
    </>
  );
}

// Async component for fetching and rendering posts
async function CampList() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);
  const threeHundredSecondInterval = Math.floor(Date.now() / (300 * 1000));
  const shuffledPosts = shufflePosts(posts, threeHundredSecondInterval).slice(
    0,
    7,
  );

  if (shuffledPosts.length === 0) return null;

  return (
    <>
      <div className="flex flex-row gap-2 items-center -mb-2">
        <h2 className="text-xl md:text-2xl font-semibold ">
          ลานกางเต็นท์แนะนำ
        </h2>
      </div>
      <CampPostsDisplay posts={shuffledPosts} />
    </>
  );
}

// Generic async component สำหรับลานกางเต็นท์ตามภาค
async function CampRegionList({
  regionSlug,
  regionName,
}: {
  regionSlug: string;
  regionName: string;
}) {
  const REGION_QUERY = `*[
    _type == "post"
    && !(_id in path("drafts.**"))
    && defined(slug.current)
    && address.region == "${regionSlug}"
  ]| order(publishedAt desc)[]{_id, title, address, thumbnail, slug, tags, otherBenefits}`;

  const posts = await client.fetch<SanityDocument[]>(REGION_QUERY, {}, options);
  const threeHundredSecondInterval = Math.floor(Date.now() / (300 * 1000));
  const shuffledPosts = shufflePosts(posts, threeHundredSecondInterval).slice(
    0,
    7,
  );

  if (shuffledPosts.length === 0) return null;

  return (
    <>
      <div className="flex flex-row gap-2 items-center -mb-2">
        <h2 className="text-xl md:text-2xl font-semibold">
          ลานกางเต็นท์{regionName}
        </h2>
        <Button
          asChild
          className="flex h-7 w-7 items-center justify-center rounded-full cursor-pointer"
          variant="default"
        >
          <Link href={`/search?region=${regionSlug}`}>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
      <CampPostsDisplay posts={shuffledPosts} />
    </>
  );
}

export default async function IndexPage() {
  const availableTags = await client.fetch<string[]>(
    AVAILABLE_TAGS_QUERY,
    {},
    options,
  );

  return (
    <main className="pb-6 lg:pb-10">
      <div className="flex relative h-80 md:h-125 flex-col">
        <HeroBanner availableTags={availableTags} />
      </div>
      <div className="container mx-auto px-2 max-w-[1800px] pt-6 lg:pt-8 lg:px-6">
        <div className="flex flex-col gap-6">
          <Suspense fallback={<CampThumbnailSkeleton count={1} />}>
            <CampList />
          </Suspense>
          {REGIONS.map((region) => (
            <Suspense
              key={region.slug}
              fallback={<CampThumbnailSkeleton count={1} />}
            >
              <CampRegionList regionSlug={region.slug} regionName={region.th} />
            </Suspense>
          ))}
        </div>
      </div>
    </main>
  );
}
