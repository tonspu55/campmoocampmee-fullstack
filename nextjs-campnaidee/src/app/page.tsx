import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import HeroBanner from "@/components/HeroBanner";
import CampRecommend from "@/components/CampRecommend";


const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]| order(publishedAt desc)[0...12]{_id, title, address, thumbnail, slug}`;

const options = { next: { revalidate: 30 } };

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  return (
    <main className="pb-6 lg:pb-10">
      <div className="flex relative h-[320px] md:h-[500px] flex-col">
        <HeroBanner />
      </div>
      <CampRecommend posts={posts} />
    </main>
  );
}