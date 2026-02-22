"use client";

import { useState, useRef, useEffect } from "react";
import { type SanityDocument } from "next-sanity";
import dynamic from "next/dynamic";
import { Map, List } from "lucide-react";
import CampThumbnail from "@/components/CampThumbnail";
import SearchPagination from "@/components/SearchPagination";
import { getThaiProvinceName } from "@/lib/provinces";
import { getThaiRegionName } from "@/lib/regions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export interface CampPost extends SanityDocument {
  title: string;
  address: { province?: string; region?: string };
  thumbnail: unknown;
  slug: { current: string };
  tags?: string[];
  location?: { lat: number; lng: number };
  otherBenefits?: string[];
}

// Dynamically import the map component to avoid SSR issues
const CampMap = dynamic(() => import("@/components/CampMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center">
      <span className="text-gray-400 dark:text-gray-500">
        กำลังโหลดแผนที่...
      </span>
    </div>
  ),
});

interface SearchMapWrapperProps {
  posts: CampPost[];
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
  totalCount,
}: SearchMapWrapperProps) {
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  // track ว่าเคยเปิด map tab หรือยัง เพื่อ lazy load
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapLoadedMobile, setMapLoadedMobile] = useState(false);
  // ใช้ ref + IntersectionObserver จับว่า tab หลุดจากจอหรือยัง
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // เมื่อ sentinel หายไปจาก viewport = tab ควร sticky
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    // Clean up the observer on unmount
    return () => observer.disconnect();
  }, []);

  // แปลง slug เป็นชื่อจังหวัด/ภาคภาษาไทย
  const provinceTh = province ? getThaiProvinceName(province) : undefined;
  const regionTh = region ? getThaiRegionName(region) : undefined;

  // สร้าง URL สำหรับ pagination
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (province) params.set("province", province);
    if (region) params.set("region", region);
    params.set("page", pageNumber.toString());
    return `/search?${params.toString()}`;
  };

  // สร้าง label สำหรับ header
  const headerLabel = provinceTh
    ? `ลานกางเต็นท์ในจังหวัด${provinceTh}`
    : regionTh
      ? `ลานกางเต็นท์ใน${regionTh}`
      : "ค้นหาทั้งหมด";

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "map" && !mapLoaded) {
      setMapLoaded(true);
    }
  };

  const handleMobileToggle = () => {
    const next = !showMap;
    setShowMap(next);
    if (next && !mapLoadedMobile) {
      setMapLoadedMobile(true);
    }
  };

  // JSX variables แทน inline component definitions เพื่อป้องกัน React remount ทุก render
  const headerJSX = (
    <div className="mb-4">
      <h1 className="text-xl md:text-2xl font-semibold">{headerLabel}</h1>
      <p>พบทั้งหมด {totalCount} ลานกางเต็นท์</p>
    </div>
  );

  const contentJSX = (
    <>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4 ">
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
      {headerJSX}

      {/* Desktop Layout - Tabs */}
      <div className="hidden lg:block">
        {/* Sentinel element - เมื่อหายไปจาก viewport จะทำให้ tab sticky */}
        <div ref={sentinelRef} className="h-0" />
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList
            className={`rounded-none! w-full sticky top-15 z-30 transition-shadow ${isSticky ? "shadow-none" : ""} bg-white dark:bg-gray-900 `}
          >
            <TabsTrigger
              value="list"
              className={`cursor-pointer ${activeTab === "list" ? "bg-primary! text-white!" : ""}`}
            >
              <List className="w-4 h-4" />
              แบบรายการ
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className={`cursor-pointer ${activeTab === "map" ? "bg-primary! text-white!" : ""}`}
            >
              <Map className="w-4 h-4" />
              แบบแผนที่
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">{contentJSX}</TabsContent>

          <TabsContent value="map">
            {mapLoaded && (
              <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden">
                <CampMap posts={posts} className="w-full h-full" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Mobile Layout - Toggle between list and map */}
      <div className="lg:hidden">
        {/* Content */}
        <div className={showMap ? "hidden" : ""}>{contentJSX}</div>

        {/* Map View - keep mounted after first load to preserve map state */}
        <div
          className={`fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-15 ${showMap ? "" : "hidden"}`}
        >
          {mapLoadedMobile && (
            <CampMap posts={posts} className="w-full h-full" />
          )}
        </div>

        {/* Toggle Button - Fixed at top */}
        <div className="fixed top-3.25 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleMobileToggle}
            aria-label={showMap ? "แสดงแบบรายการ" : "แสดงแบบแผนที่"}
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
