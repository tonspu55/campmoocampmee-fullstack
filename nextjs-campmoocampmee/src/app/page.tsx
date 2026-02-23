import { Suspense } from "react";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import HeroBanner from "@/components/HeroBanner";
import CampThumbnail, {
  CampThumbnailSkeleton,
} from "@/components/CampThumbnail";
import Link from "next/link";
import styles from "@/app/homepage.module.css";
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
const options = { next: { revalidate: 300 } };

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

// Async component for fetching and rendering posts
async function CampList() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);
  const threeHundredSecondInterval = Math.floor(Date.now() / (300 * 1000));
  const shuffledPosts = shufflePosts(posts, threeHundredSecondInterval).slice(
    0,
    4,
  );

  if (shuffledPosts.length === 0) return null;

  return (
    <>
      <div className="flex flex-row gap-2 items-center -mb-2">
        <h2 className="text-xl md:text-2xl font-semibold ">
          ลานกางเต็นท์แนะนำ
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        <CampThumbnail posts={shuffledPosts} />
      </div>
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
    4,
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
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        <CampThumbnail posts={shuffledPosts} />
      </div>
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
      <div className="container mx-auto px-2 max-w-6xl pt-6 lg:pt-8">
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
        <div
          className={`${styles.contactBg} rounded-[20px] mt-6 lg:mt-8 flex flex-col h-67.5!  lg:h-100!`}
        >
          <div className="flex flex-col items-start justify-start lg:justify-center h-full">
            <div className="w-[80%] lg:w-[50%]">
              <div className="flex flex-col items-start max-lg:pt-4 max-lg:px-4 lg:pl-16">
                <h4 className="text-white  text-[16px] lg:text-[18px] font-bold">
                  เปลี่ยนลานกางเต็นท์ของคุณ ให้เป็นจุดหมายใหม่ของนักเดินทาง
                </h4>
                <p className="text-white  font-medium text-[14px] lg:text-[16px] mt-2">
                  สำหรับเจ้าของธุรกิจลที่สนใจลงข้อมูลเกี่ยวกับที่พักของท่านผ่านเว็บแคมป์หมูแคมป์หมี
                  เพื่อนำหน้าเพจไปใช้โปรโมทผ่านช่องทางต่างๆฟรีโดยไม่มีค่าใช้จ่ายใดๆทั้งสิ้นในการลงข้อมูล
                </p>
                <Button
                  asChild
                  className="cursor-pointer mt-4"
                  variant="default"
                >
                  <Link href="/contact">ติดต่อลงข้อมูล</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
