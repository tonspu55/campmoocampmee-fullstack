import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import HeroBanner from "@/components/HeroBanner";
import CampRecommend from "@/components/CampRecommend";


const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
  && "recommend" in tags
]| order(publishedAt desc)[0...12]{_id, title, address, thumbnail, slug, tags}`;


const options = { next: { revalidate: 60 } };

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);


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
      <CampRecommend posts={shuffledPosts} />
    </main>
  );
}