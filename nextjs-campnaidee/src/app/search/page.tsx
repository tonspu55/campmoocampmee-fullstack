import { Suspense } from "react";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import { CampThumbnailSkeleton } from "@/components/CampThumbnail";
import type { Metadata } from "next";
import SearchMapWrapper from "@/components/SearchMapWrapper";

interface SearchPageProps {
  searchParams: Promise<{
    province?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { province, } = await searchParams;

  return {
    title: `ค้นหาลานกางเต็นท์ ${province} `,
    description: "ค้นหาลานกางเต็นท์ ผ่านข้อมูลจากเจ้าของที่พักที่ถูกต้อง แผนที่-เส้นทาง อัพเดต 2026 ",
  };
}
//  ตัวเลือกสำหรับการดึงข้อมูลจาก Sanity
const options = { next: { revalidate: 300 } };

// Async component for fetching and rendering search results
async function SearchResults({ province, page }: { province?: string; page?: string }) {
  // Pagination settings
  const itemsPerPage = 10;
  // Calculate current page and offset
  const currentPage = parseInt(page || '1', 10);
  const offset = (currentPage - 1) * itemsPerPage;

  // Query สำหรับนับจำนวนรายการทั้งหมด (สำหรับ pagination)
  const COUNT_QUERY = province
    ? `count(*[
        _type == "post"
        && !(_id in path("drafts.**"))
        && defined(slug.current)
        && (
          address.province == "${province}" ||
          address.province match "${province}*" ||
          address.province match "*${province}*"
        )
      ])`
    : `count(*[
        _type == "post"
        && !(_id in path("drafts.**"))
        && defined(slug.current)
      ])`;

  // Query สำหรับดึงข้อมูลแบบ pagination
  const SEARCH_QUERY = province
    ? `*[
        _type == "post"
        && !(_id in path("drafts.**"))
        && defined(slug.current)
        && (
          address.province == "${province}" ||
          address.province match "${province}*" ||
          address.province match "*${province}*"
        )
      ]| order(publishedAt desc)[${offset}...${offset + itemsPerPage}]{_id, title, address, thumbnail, slug, tags, location, otherBenefits}`
    : `*[
        _type == "post"
        && !(_id in path("drafts.**"))
        && defined(slug.current)
      ]| order(publishedAt desc)[${offset}...${offset + itemsPerPage}]{_id, title, address, thumbnail, slug, tags, location, otherBenefits}`;

  // ดึงข้อมูลทั้งหมดและข้อมูลสำหรับหน้าปัจจุบัน
  const [totalCount, allPosts] = await Promise.all([
    client.fetch<number>(COUNT_QUERY, {}, options),
    client.fetch<SanityDocument[]>(SEARCH_QUERY, {}, options)
  ]);

  // เพิ่มการกรองใน JavaScript เพื่อความแม่นยำ
  let posts = allPosts;
  let filteredCount = totalCount;

  if (province) {
    // สำหรับการค้นหาตามจังหวัด เราต้องดึงข้อมูลทั้งหมดก่อนแล้วกรอง
    const ALL_POSTS_QUERY = `*[
      _type == "post"
      && !(_id in path("drafts.**"))
      && defined(slug.current)
      && (
        address.province == "${province}" ||
        address.province match "${province}*" ||
        address.province match "*${province}*"
      )
    ]| order(publishedAt desc){_id, title, address, thumbnail, slug, tags, otherBenefits, location}`;

    const allMatchingPosts = await client.fetch<SanityDocument[]>(ALL_POSTS_QUERY, {}, options);

    const filteredPosts = allMatchingPosts.filter(post => {
      const postProvince = post.address?.province;
      if (!postProvince) return false;

      // เปรียบเทียบแบบ case-insensitive และ trim whitespace
      const normalizedPostProvince = postProvince.trim().toLowerCase();
      const normalizedSearchProvince = province.trim().toLowerCase();

      return normalizedPostProvince === normalizedSearchProvince ||
        normalizedPostProvince.includes(normalizedSearchProvince);
    });

    filteredCount = filteredPosts.length;
    posts = filteredPosts.slice(offset, offset + itemsPerPage);
  }

  // คำนวณ pagination
  const totalPages = Math.ceil(filteredCount / itemsPerPage);

  return (
    <>
      {posts.length > 0 ? (
        <SearchMapWrapper
          posts={posts}
          currentPage={currentPage}
          totalPages={totalPages}
          province={province}
          totalCount={filteredCount}
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-xl md:text-2xl">
            {province
              ? `ไม่พบลานกางเต็นท์ในจังหวัด${province}`
              : "ไม่พบข้อมูลลานกางเต็นท์"
            }
          </p>
        </div>
      )}
    </>
  );
}


function SearchResultsSkeleton() {
  return (
    <div className="mt-4">
      <CampThumbnailSkeleton count={1} />
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { province, page } = await searchParams;

  return (
    <main className="max-lg:pb-6 max-lg:pt-12 lg:py-10">
      <div className="container mx-auto px-2 max-w-6xl pt-6 lg:pt-10">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults province={province} page={page} />
        </Suspense>
      </div>
    </main>
  );
}
