"use client";

import { useState } from "react";
import { type SanityDocument } from "next-sanity";
import dynamic from "next/dynamic";
import { Map, List } from "lucide-react";
import CampThumbnail from "@/components/CampThumbnail";
import SearchPagination from "@/components/SearchPagination";
import { getThaiProvinceName } from "@/lib/provinces";
import { getThaiRegionName } from "@/lib/regions";

// Dynamically import the map component to avoid SSR issues
const CampMap = dynamic(() => import("@/components/CampMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 dark:text-gray-500">กำลังโหลดแผนที่...</span>
    </div>
  ),
});

interface SearchMapWrapperProps {
  posts: SanityDocument[];
  currentPage: number;
  totalPages: number;
  province?: string;
  region?: string;
  totalCount: number;
}

export default function SearchMapWrapper({
  posts,
  currentPage,
  totalPages,
  province,
  region,
  totalCount
}: SearchMapWrapperProps) {
  const [showMap, setShowMap] = useState(false);

  // แปลง slug เป็นชื่อจังหวัด/ภาคภาษาไทย
  const provinceTh = province ? getThaiProvinceName(province) : undefined;
  const regionTh = region ? getThaiRegionName(region) : undefined;

  // Always show map section
  const showMapSection = true;

  // สร้าง URL สำหรับ pagination
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (province) params.set('province', province);
    if (region) params.set('region', region);
    params.set('page', pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  // สร้าง label สำหรับ header
  const headerLabel = provinceTh
    ? `ลานกางเต็นท์ในจังหวัด${provinceTh}`
    : regionTh
      ? `ลานกางเต็นท์ใน${regionTh}`
      : 'ค้นหาทั้งหมด';

  // Header Component
  const Header = () => (
    <div className="mb-4">
      <h1 className="text-xl md:text-2xl font-semibold">
        {headerLabel}
      </h1>
      <p>
        พบทั้งหมด {totalCount} {(provinceTh || regionTh) ? 'ลานกางเต็นท์' : 'แคมป์'}
      </p>
    </div>
  );

  // Content Component
  const Content = () => (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-4 ">
        <CampThumbnail posts={posts} />
      </div>
      <SearchPagination
        currentPage={currentPage}
        totalPages={totalPages}
        createPageUrl={createPageUrl}
      />
    </>
  );

  return (
    <>
      <Header />
      {/* Desktop Layout */}
      <div className="hidden lg:flex lg:flex-row lg:gap-4">
        {/* Left side - Camp list with scroll */}
        <div className={`${showMapSection && 'basis-1/2'} `}>
          <Content />
        </div>

        {/* Right side - Sticky Map */}
        {showMapSection && (
          <div className="basis-1/2 sticky top-24 h-[calc(100vh-120px)] rounded-xl overflow-hidden self-start">
            <CampMap posts={posts} className="w-full h-full" />
          </div>
        )}
      </div>

      {/* Mobile Layout - Toggle between list and map */}
      <div className="lg:hidden">
        {/* Content */}
        <div className={showMap ? "hidden" : ""}>
          <Content />
        </div>

        {/* Map View */}
        {showMap && (
          <div className="fixed inset-0 z-40 bg-white  pt-15">
            <CampMap posts={posts} className="w-full h-full" />
          </div>
        )}

        {/* Toggle Button - Fixed at top */}
        <div className="fixed top-3.25 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowMap(!showMap)}
            className="flex items-center gap-2 px-4 py-2 border border-primary  dark:bg-white text-primary dark:text-primary rounded-full   transition-all active:scale-95"
          >
            {showMap ? (
              <>
                <List className="w-4 h-4" />
                <span className="text-sm">แบบรายการ</span>
              </>
            ) : (
              <>
                <Map className="w-4 h-4" />
                <span className="text-sm">แบบแผนที่</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
