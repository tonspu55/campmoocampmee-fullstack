import { Suspense } from "react";
import { readClient as client } from "@/sanity/client";
import { CampThumbnailSkeleton } from "@/components/CampThumbnail";
import type { Metadata } from "next";
import SearchMapWrapper, { type CampPost } from "@/components/SearchMapWrapper";
import { getThaiProvinceName } from "@/lib/provinces";
import { getThaiRegionName } from "@/lib/regions";
import { TAG_LABELS } from "@/lib/tags";
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
    tag?: string;
  }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { province: provinceSlug, region: regionSlug, tag: tagParam } = await searchParams;

  const provinceTh = provinceSlug
    ? getThaiProvinceName(provinceSlug)
    : undefined;
  const regionTh = regionSlug ? getThaiRegionName(regionSlug) : undefined;
  const tagLabel = tagParam ? TAG_LABELS[tagParam] : undefined;

  const locationLabel =
    provinceTh || provinceSlug || regionTh || regionSlug || tagLabel || "";
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
function buildFilterConditions(province?: string, regionSlug?: string, tag?: string): string {
  const conditions: string[] = [];

  if (province) {
    // ใช้ GROQ param $province แทน string interpolation
    conditions.push(`&& address.province == $province`);
  } else if (regionSlug) {
    // ใช้ GROQ param เพื่อป้องกัน injection จาก raw URL param
    conditions.push(`&& address.region == $region`);
  }

  if (tag) {
    conditions.push(`&& $tag in tags`);
  }

  return conditions.join("\n    ");
}

function buildBaseFilter(province?: string, regionSlug?: string, tag?: string): string {
  const filterConditions = buildFilterConditions(province, regionSlug, tag);

  return `*[
    _type == "post"
    && !(_id in path("drafts.**"))
    && defined(slug.current)
    ${filterConditions}
  ]`;
}

function buildCountQuery(province?: string, regionSlug?: string, tag?: string): string {
  return `count(${buildBaseFilter(province, regionSlug, tag)})`;
}

function buildSearchQuery(
  offset: number,
  limit: number,
  province?: string,
  regionSlug?: string,
  tag?: string,
): string {
  const baseFilter = buildBaseFilter(province, regionSlug, tag);

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
  tag,
}: {
  provinceSlug?: string;
  regionSlug?: string;
  page?: string;
  tag?: string;
}) {
  const province = provinceSlug ? getThaiProvinceName(provinceSlug) : undefined;
  const regionTh = regionSlug ? getThaiRegionName(regionSlug) : undefined;

  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  // Build queries using helper functions
  const countQuery = buildCountQuery(province, regionSlug, tag);
  const searchQuery = buildSearchQuery(
    offset,
    ITEMS_PER_PAGE,
    province,
    regionSlug,
    tag,
  );

  // ส่ง province, region และ tag เป็น GROQ params (ไม่ interpolate ลงใน query string)
  const queryParams: Record<string, string> = {};
  if (province) queryParams.province = province;
  if (regionSlug) queryParams.region = regionSlug;
  if (tag) queryParams.tag = tag;

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
          tag={tag}
          totalCount={totalCount}
        />
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-xl md:text-2xl">
            {province
              ? `ไม่พบลานกางเต็นท์ในจังหวัด${province}`
              : regionTh
                ? `ไม่พบลานกางเต็นท์ใน${regionTh}`
                : tag && TAG_LABELS[tag]
                  ? `ไม่พบลานกางเต็นท์ในหมวด${TAG_LABELS[tag]}`
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
  const { province, region, page, tag } = await searchParams;

  const provinceTh = province ? getThaiProvinceName(province) : undefined;
  const regionTh = region ? getThaiRegionName(region) : undefined;
  const tagLabel = tag ? TAG_LABELS[tag] : undefined;
  const breadcrumbLabel = provinceTh
    ? `จังหวัด${provinceTh}`
    : regionTh
      ? regionTh
      : tagLabel
        ? tagLabel
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
            tag={tag}
          />
        </Suspense>
      </div>
    </main>
  );
}
