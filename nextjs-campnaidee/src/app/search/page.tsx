import { Suspense } from "react";
import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import CampThumbnail, { CampThumbnailSkeleton } from "@/components/CampThumbnail";
import type { Metadata } from "next";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
      ]| order(publishedAt desc)[${offset}...${offset + itemsPerPage}]{_id, title, address, thumbnail, slug, tags}`
    : `*[
        _type == "post"
        && !(_id in path("drafts.**"))
        && defined(slug.current)
      ]| order(publishedAt desc)[${offset}...${offset + itemsPerPage}]{_id, title, address, thumbnail, slug, tags}`;

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
    ]| order(publishedAt desc){_id, title, address, thumbnail, slug, tags, otherBenefits}`;

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
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // สร้าง URL สำหรับ pagination
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (province) params.set('province', province);
    params.set('page', pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  // สร้างรายการหน้าที่จะแสดงใน pagination
  const getPaginationNumbers = () => {
    const delta = 2; // จำนวนหน้าที่แสดงข้างๆ หน้าปัจจุบัน
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <>
      {province && (
        <>
          <h1 className="text-xl md:text-2xl font-semibold">
            ลานกางเต็นท์ในจังหวัด{province}
          </h1>
          <p >
            พบทั้งหมด {filteredCount} ลานกางเต็นท์
          </p>
        </>
      )}

      {!province && (
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-semibold">ค้นหาทั้งหมด</h1>
          <p>
            พบทั้งหมด {filteredCount} แคมป์
          </p>
        </div>
      )}

      {posts.length > 0 ? (
        <>
          <div className="mt-4">
            <CampThumbnail posts={posts} />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  {hasPrevPage && (
                    <PaginationItem>
                      <PaginationPrevious href={createPageUrl(currentPage - 1)} />
                    </PaginationItem>
                  )}

                  {getPaginationNumbers().map((page, index) => (
                    <PaginationItem key={index}>
                      {page === '...' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href={createPageUrl(Number(page))}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                  {hasNextPage && (
                    <PaginationItem >
                      <PaginationNext href={createPageUrl(currentPage + 1)} />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
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
    <>

      <div className="mt-4">
        <CampThumbnailSkeleton count={4} />
      </div>
    </>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { province, page } = await searchParams;

  return (
    <main className="py-8 lg:py-10 mt-11.25 lg:mt-15">
      <div className="container mx-auto max-w-6xl px-2">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults province={province} page={page} />
        </Suspense>
      </div>
    </main>
  );
}
