"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TabGalleryPopup from "./TabGalleryPopup";
import VideoEmbed from "./VideoEmbed";
import {
  galleryImageAnchorId,
  isVideoItem,
  type TabGalleryProps,
} from "@/types/gallery";

const ALL_TAB = "ทั้งหมด";

/** ลำดับที่อยากให้หมวดหมู่แสดงผล — หมวดอื่นที่ไม่อยู่ในลิสต์จะต่อท้าย */
const CATEGORY_ORDER = [
  ALL_TAB,
  "วิว",
  "กิจกรรม",
  "ที่พัก",
  "ห้องน้ำ",
  "วิดีโอ",
];

const TabGallery = ({ dataGallery, slug, postTitle }: TabGalleryProps) => {
  const [activeTab, setActiveTab] = useState(ALL_TAB);
  const [isStuck, setIsStuck] = useState(false);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allCategories = useMemo(() => {
    const categories = [
      ...new Set(dataGallery.map((item) => item.category)),
    ].filter(Boolean);

    return CATEGORY_ORDER.filter(
      (c) => c === ALL_TAB || categories.includes(c),
    ).concat(categories.filter((c) => !CATEGORY_ORDER.includes(c)));
  }, [dataGallery]);

  const filteredData = useMemo(
    () =>
      activeTab === ALL_TAB
        ? dataGallery
        : dataGallery.filter((item) => item.category === activeTab),
    [dataGallery, activeTab],
  );

  // แถบหมวดหมู่ใช้ sticky — sentinel บอกแค่ว่าตอนนี้แถบติดบนอยู่หรือยัง
  // (ใช้ตัดสินใจว่าจะโชว์ปุ่มย้อนกลับแทน header ที่เลื่อนพ้นจอไปแล้วไหม)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  // เข้าหน้านี้จากการคลิกรูปบนหน้า land จะมี hash `#img-<key>` ติดมา
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#img-")) return;

    document
      .getElementById(hash.slice(1))
      ?.scrollIntoView({ block: "center" });
  }, []);

  const handleTabClick = (category: string) => {
    setActiveTab(category);

    // เลื่อนเลยแถบหมวดหมู่มาแล้วค่อยดึงกลับมาที่หัวแกลเลอรี
    if (isStuck) {
      sentinelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <>
      {/* จุดอ้างอิงว่าแถบหมวดหมู่ติดบนหรือยัง */}
      <div ref={sentinelRef} aria-hidden className="h-px" />

      {/* Tabs */}
      <div className="scrollbar-hide bg-background sticky top-0 z-10 flex gap-2 overflow-x-auto py-4">
        {isStuck && (
          <Button
            asChild
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
            variant="default"
          >
            <Link href={`/land/${slug}`} aria-label="กลับไปหน้าที่พัก">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {allCategories.map((category) => (
          <Button
            key={category}
            onClick={() => handleTabClick(category)}
            aria-pressed={activeTab === category}
            className={cn(
              "shrink-0 px-4 py-2",
              activeTab !== category &&
                "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-2 gap-2">
        {filteredData.map((item, index) => {
          if (isVideoItem(item)) {
            return (
              <div key={item._key} className="col-span-full">
                <VideoEmbed item={item} />
              </div>
            );
          }

          const isWide = index % 3 === 0;

          return (
            <button
              key={item._key}
              id={galleryImageAnchorId(item._key)}
              type="button"
              onClick={() => setPopupIndex(index)}
              className={cn(
                "focus-visible:ring-ring relative aspect-square cursor-pointer overflow-hidden focus-visible:ring-2 focus-visible:outline-none",
                isWide ? "col-span-2" : "col-span-2 md:col-span-1",
              )}
            >
              <Image
                src={item.url}
                alt={item.alt || `${postTitle} รูปที่ ${index + 1}`}
                fill
                sizes={
                  isWide
                    ? "(min-width: 900px) 900px, 100vw"
                    : "(min-width: 900px) 450px, 100vw"
                }
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {filteredData.length === 0 && (
        <div className="text-muted-foreground py-8 text-center">
          ไม่พบข้อมูลในหมวดหมู่นี้
        </div>
      )}

      <TabGalleryPopup
        isOpen={popupIndex !== null}
        onClose={() => setPopupIndex(null)}
        images={filteredData}
        currentIndex={popupIndex ?? 0}
        postTitle={postTitle}
      />
    </>
  );
};

export default TabGallery;
