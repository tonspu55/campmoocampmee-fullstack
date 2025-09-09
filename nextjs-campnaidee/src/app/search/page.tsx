import { type SanityDocument } from "next-sanity";
import { client } from "@/sanity/client";
import CampThumbnail from "@/components/CampThumbnail";
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

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { province, page } = await searchParams;

  // Pagination settings
  const itemsPerPage = 10;
  const currentPage = parseInt(page || '1', 10);
  const offset = (currentPage - 1) * itemsPerPage;

  // Query สำหรับนับจำนวนรายการทั้งหมด (สำหรับ pagination)
  const COUNT_QUERY = province
    ? `count(*[
        _type == "post"
        && defined(slug.current)
        && (
          address.province == "${province}" ||
          address.province match "${province}*" ||
          address.province match "*${province}*"
        )
      ])`
    : `count(*[
        _type == "post"
        && defined(slug.current)
      ])`;

  // Query สำหรับดึงข้อมูลแบบ pagination
  const SEARCH_QUERY = province
    ? `*[
        _type == "post"
        && defined(slug.current)
        && (
          address.province == "${province}" ||
          address.province match "${province}*" ||
          address.province match "*${province}*"
        )
      ]| order(publishedAt desc)[${offset}...${offset + itemsPerPage}]{_id, title, address, thumbnail, slug, tags}`
    : `*[
        _type == "post"
        && defined(slug.current)
      ]| order(publishedAt desc)[${offset}...${offset + itemsPerPage}]{_id, title, address, thumbnail, slug, tags}`;

  const options = { next: { revalidate: 60 } };

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
      && defined(slug.current)
      && (
        address.province == "${province}" ||
        address.province match "${province}*" ||
        address.province match "*${province}*"
      )
    ]| order(publishedAt desc){_id, title, address, thumbnail, slug, tags}`;

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

  // Debug log
  // console.log("Search province:", province);
  // console.log("Search query:", SEARCH_QUERY);
  // console.log("Found posts (after filtering):", posts.length);
  // console.log("Posts addresses:", posts.map(post => ({
  //   title: post.title,
  //   province: post.address?.province
  // })));

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
    <main className="py-8 lg:py-10 mt-[60px]">
      <div className="container mx-auto max-w-6xl px-2">
        {province && (
          <>
            <h4 className="text-lg font-bold">
              แคมป์ในจังหวัด {province}
            </h4>
            <p className="text-gray-600">
              พบทั้งหมด {filteredCount} แคมป์
            </p>
          </>
        )}

        {!province && (
          <div className="mb-4">
            <h4 className="text-lg font-bold">ค้นหาทั้งหมด</h4>
            <p className="text-gray-600">
              พบทั้งหมด {filteredCount} แคมป์
            </p>
          </div>
        )}

        {posts.length > 0 ? (
          <>
            <div className="mt-4">
              <CampThumbnail posts={posts} showTitle={false} />
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
