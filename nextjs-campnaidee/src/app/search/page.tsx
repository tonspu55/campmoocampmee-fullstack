import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import CampRecommend from "@/components/CampRecommend";

interface SearchPageProps {
  searchParams: {
    province?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { province } = searchParams;

  // Query สำหรับค้นหาตามจังหวัด - ใช้ multiple conditions เพื่อความแม่นยำ
  const SEARCH_QUERY = province
    ? `*[
        _type == "post"
        && defined(slug.current)
        && (
          address.province == "${province}" ||
          address.province match "${province}*" ||
          address.province match "*${province}*"
        )
      ]| order(publishedAt desc){_id, title, address, thumbnail, slug, tags}`
    : `*[
        _type == "post"
        && defined(slug.current)
      ]| order(publishedAt desc)[0...20]{_id, title, address, thumbnail, slug, tags}`;

  const options = { next: { revalidate: 60 } };
  let posts = await client.fetch<SanityDocument[]>(SEARCH_QUERY, {}, options);

  // เพิ่มการกรองใน JavaScript เพื่อความแม่นยำ
  if (province) {
    posts = posts.filter(post => {
      const postProvince = post.address?.province;
      if (!postProvince) return false;

      // เปรียบเทียบแบบ case-insensitive และ trim whitespace
      const normalizedPostProvince = postProvince.trim().toLowerCase();
      const normalizedSearchProvince = province.trim().toLowerCase();

      return normalizedPostProvince === normalizedSearchProvince ||
        normalizedPostProvince.includes(normalizedSearchProvince);
    });
  }

  // Debug log
  // console.log("Search province:", province);
  // console.log("Search query:", SEARCH_QUERY);
  // console.log("Found posts (after filtering):", posts.length);
  // console.log("Posts addresses:", posts.map(post => ({
  //   title: post.title,
  //   province: post.address?.province
  // })));

  return (
    <main className="py-8 lg:py-10 mt-[60px]">


      <div className="container mx-auto max-w-6xl px-2">
        {province && (
          <>
            <h4 className="text-lg font-bold">
              แคมป์ในจังหวัด {province}
            </h4>
            <p className="text-gray-600">
              พบ {posts.length} แคมป์
            </p>
          </>
        )}

        {posts.length > 0 ? (
          <div className="mt-4">
            <CampRecommend posts={posts} showTitle={false} />
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">
              {province
                ? `ไม่พบแคมป์ในจังหวัด ${province}`
                : "ไม่พบข้อมูลแคมป์"
              }
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
