import { Suspense } from "react";
import { client } from "@/sanity/client";
import { CampThumbnailSkeleton } from "@/components/CampThumbnail";
import type { Metadata } from "next";
import SearchMapWrapper, { type CampPost } from "@/components/SearchMapWrapper";
import { getThaiProvinceName } from "@/lib/provinces";
import { getThaiRegionName } from "@/lib/regions";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface SearchPageProps {
  searchParams: Promise<{
    province?: string;
    region?: string;
    page?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { province: provinceSlug, region: regionSlug } = await searchParams;

  const provinceTh = provinceSlug
    ? getThaiProvinceName(provinceSlug)
    : undefined;
  const regionTh = regionSlug ? getThaiRegionName(regionSlug) : undefined;

  const locationLabel =
    provinceTh || provinceSlug || regionTh || regionSlug || "";
  const titleSuffix = locationLabel ? ` ${locationLabel}` : "";

  return {
    title: `ค้นหาลานกางเต็นท์${titleSuffix}`,
    description:
      "ค้นหาลานกางเต็นท์ ผ่านข้อมูลจากเจ้าของที่พักที่ถูกต้อง แผนที่-เส้นทาง อัพเดต 2026 ",
  };
}

const options = { next: { revalidate: 300 } };
const ITEMS_PER_PAGE = 12;

// Helper functions for building GROQ queries
function buildFilterConditions(province?: string, regionSlug?: string): string {
  if (province) {
    // ใช้ GROQ param $province แทน string interpolation
    // address.province เก็บชื่อไทยตรงๆ จาก Sanity → exact match เพียงพอ
    // หลีกเลี่ยง match operator ที่มี leading * ซึ่งไม่ใช่ GROQ standard และอาจ match ทุก document
    return `&& address.province == $province`;
  }

  if (regionSlug) {
    // ใช้ GROQ param เพื่อป้องกัน injection จาก raw URL param
    return `&& address.region == $region`;
  }

  return "";
}

function buildBaseFilter(province?: string, regionSlug?: string): string {
  const filterConditions = buildFilterConditions(province, regionSlug);

  return `*[
    _type == "post"
    && !(_id in path("drafts.**"))
    && defined(slug.current)
    ${filterConditions}
  ]`;
}

function buildCountQuery(province?: string, regionSlug?: string): string {
  return `count(${buildBaseFilter(province, regionSlug)})`;
}

function buildSearchQuery(
  offset: number,
  limit: number,
  province?: string,
  regionSlug?: string,
): string {
  const baseFilter = buildBaseFilter(province, regionSlug);

  return `${baseFilter} | order(publishedAt desc)[${offset}...${offset + limit}]{
    _id,
    title,
    address,
    thumbnail,
    slug,
    tags,
    location,
    otherBenefits
  }`;
}

// Async component for fetching and rendering search results
async function SearchResults({
  provinceSlug,
  regionSlug,
  page,
}: {
  provinceSlug?: string;
  regionSlug?: string;
  page?: string;
}) {
  const province = provinceSlug ? getThaiProvinceName(provinceSlug) : undefined;
  const regionTh = regionSlug ? getThaiRegionName(regionSlug) : undefined;

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build queries using helper functions
  const countQuery = buildCountQuery(province, regionSlug);
  const searchQuery = buildSearchQuery(
    offset,
    ITEMS_PER_PAGE,
    province,
    regionSlug,
  );

  // ส่ง province และ region เป็น GROQ params ทั้งคู่ (ไม่ interpolate ลงใน query string)
  const queryParams: Record<string, string> = {};
  if (province) queryParams.province = province;
  if (regionSlug) queryParams.region = regionSlug;

  // Fetch data in parallel
  const [totalCount, posts] = await Promise.all([
    client.fetch<number>(countQuery, queryParams, options),
    client.fetch<CampPost[]>(searchQuery, queryParams, options),
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      {posts.length > 0 ? (
        <SearchMapWrapper
          posts={posts}
          currentPage={currentPage}
          totalPages={totalPages}
          province={provinceSlug}
          region={regionSlug}
          totalCount={totalCount}
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-xl md:text-2xl">
            {province
              ? `ไม่พบลานกางเต็นท์ในจังหวัด${province}`
              : regionTh
                ? `ไม่พบลานกางเต็นท์ใน${regionTh}`
                : provinceSlug
                  ? `ไม่พบลานกางเต็นท์ในจังหวัด${provinceSlug}`
                  : regionSlug
                    ? `ไม่พบลานกางเต็นท์ในภาค${regionSlug}`
                    : "ไม่พบข้อมูลลานกางเต็นท์"}
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
  const { province, region, page } = await searchParams;

  const provinceTh = province ? getThaiProvinceName(province) : undefined;
  const regionTh = region ? getThaiRegionName(region) : undefined;
  const breadcrumbLabel = provinceTh
    ? `จังหวัด${provinceTh}`
    : regionTh
      ? regionTh
      : province || region || "ลานกางเต็นท์ทั้งหมด";

  return (
    <main className="max-lg:pb-6 max-lg:pt-12 lg:py-10">
      <div className="container mx-auto px-2 max-w-6xl pt-6 lg:pt-10">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">หน้าหลัก</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults
            provinceSlug={province}
            regionSlug={region}
            page={page}
          />
        </Suspense>
      </div>
    </main>
  );
}
