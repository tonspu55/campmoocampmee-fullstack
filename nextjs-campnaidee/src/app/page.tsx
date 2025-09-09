import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import HeroBanner from "@/components/HeroBanner";
import CampThumbnail from "@/components/CampThumbnail";
import Link from "next/link";
import styles from "@/app/homepage.module.css";
import { Button } from "@/components/ui/button";


const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
  && "recommend" in tags
]| order(publishedAt desc)[0...40]{_id, title, address, thumbnail, slug, tags}`;


const options = { next: { revalidate: 60 } };

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  // console.log("Fetched address:", posts.map(post => post.address));


  // สร้าง seed จาก timestamp ทุก 60 วินาที
  const sixtySecondInterval = Math.floor(Date.now() / (60 * 1000));

  // ใช้ seed เพื่อสุ่มแบบคงที่ในช่วง 60 วินาทีเดียวกัน
  const shufflePosts = (array: SanityDocument[], seed: number) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let randomIndex;

    // สร้าง pseudo-random number generator จาก seed
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    let seedValue = seed;

    while (currentIndex !== 0) {
      seedValue = seedValue * 1103515245 + 12345;
      randomIndex = Math.floor(seededRandom(seedValue) * currentIndex);
      currentIndex--;

      [shuffled[currentIndex], shuffled[randomIndex]] =
        [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  };

  const shuffledPosts = shufflePosts(posts, sixtySecondInterval);

  return (
    <main className="pb-6 lg:pb-10">
      <div className="flex relative h-[320px] md:h-[500px] flex-col">
        <HeroBanner />
      </div>
      <div className="container mx-auto px-2 max-w-6xl pt-6 lg:pt-10">
        <CampThumbnail posts={shuffledPosts} />
        <div className={`${styles.contactBg} rounded-2xl mt-6 lg:mt-10 flex flex-col h-[270px]!  lg:h-[400px]!`}>
          <div className="flex flex-col items-start justify-start lg:justify-center h-full">
            <div className="w-[80%] lg:w-[50%]">
              <div className="flex flex-col gap-4 items-start max-lg:pt-[16px] max-lg:px-[16px] lg:pl-[10%]">
                <h4 className="text-white dark:text-white font-medium text-[14px] lg:text-[16px]">สำหรับเจ้าของธุรกิจลานกางเต็นท์หรือแคมป์ปิ้งที่สนใจลงข้อมูลเกี่ยวกับที่พักของท่านผ่านเว็บแคมป์หมูแคมป์หมี เพื่อนำหน้าเพจไปใช้โปรโมทผ่านช่องทางต่างๆฟรีโดยไม่มีค่าใช้จ่ายใดๆทั้งสิ้นในการลงข้อมูล</h4>
                <Button asChild className="cursor-pointer" variant="default">
                  <Link href="/contact">
                    ติดต่อลงข้อมูล
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main >
  );
}