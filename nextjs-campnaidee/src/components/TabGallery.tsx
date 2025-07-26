"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button"

type GalleryItem = {
  url: string | null;
  category: string | null;
}

interface TabGalleryProps {
  dataGallery: GalleryItem[];
}

const TabGallery = ({ dataGallery }: TabGalleryProps) => {
  const categories = [...new Set(dataGallery.map((data) => data.category))].filter(Boolean) as string[];
  // กำหนดลำดับที่แสดงผลของหมวดหมู่
  const categoryOrder = ["ทั้งหมด", "วิว", "กิจกรรม", "ที่พัก", "ห้องน้ำ"];

  // เรียงลำดับตาม categoryOrder และเพิ่มหมวดหมู่อื่นๆ ที่ไม่อยู่ในลิสต์ไว้ท้าย
  const allCategories = categoryOrder.filter(c =>
    c === "ทั้งหมด" || categories.includes(c)
  ).concat(
    categories.filter(c => !categoryOrder.includes(c))
  );

  const [activeTab, setActiveTab] = useState("ทั้งหมด");
  const [isFixed, setIsFixed] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [originalTabsTop, setOriginalTabsTop] = useState(0);

  useEffect(() => {
    // เก็บตำแหน่งเดิมของ tabs
    if (tabsRef.current && originalTabsTop === 0) {
      setOriginalTabsTop(tabsRef.current.offsetTop);
    }
  }, [originalTabsTop]);

  useEffect(() => {
    const handleScroll = () => {
      if (tabsRef.current && originalTabsTop > 0) {
        const scrollY = window.scrollY;
        const tabsTop = tabsRef.current.getBoundingClientRect().top;

        // ถ้า scroll มาถึงตำแหน่งเดิมของ tabs หรือเลยขึ้นไป ให้ยกเลิก fixed
        if (scrollY <= originalTabsTop) {
          setIsFixed(false);
        }
        // ถ้า scroll ลงไปจนกระทั่ง tabs จะหายจากด้านบน ให้เริ่ม fixed
        else if (tabsTop <= 0 && scrollY > originalTabsTop) {
          setIsFixed(true);
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // cleanup function to remove the event listener
    return () => window.removeEventListener('scroll', handleScroll);
  }, [originalTabsTop]);

  const filteredData = activeTab === "ทั้งหมด"
    ? dataGallery
    : dataGallery.filter((item) => item.category === activeTab);

  const handleTabClick = (category: string) => {
    setActiveTab(category);

    // Scroll to top สำหรับ iOS Safari/Chrome
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isMobile = window.innerWidth <= 768;

    if (isIOS || isMobile) {
      // สำหรับ iOS และ mobile - scroll ไปด้านบนสุดเสมอ
      setTimeout(() => {
        // ลอง smooth scroll ก่อน
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        // ใช้ instant scroll เป็น fallback เพื่อให้แน่ใจ
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      }, 50);
    } else {
      // สำหรับ desktop - scroll ไปยัง tabs element
      if (tabsRef.current) {
        const tabsPosition = tabsRef.current.offsetTop;
        window.scrollTo({
          top: tabsPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <>
      {/* Tabs */}
      <div
        ref={tabsRef}
        className={`flex flex-wrap gap-2 py-4 transition-all duration-200 z-10 bg-white dark:bg-[var(--background)]  ${isFixed
          ? 'fixed top-0 left-0 right-0 max-md:px-2  py-4 container mx-auto max-w-[884px]'
          : 'relative'
          }`}
      >
        {allCategories.map((category) => (
          <Button
            key={category}
            onClick={() => handleTabClick(category)}
            className={`px-4 py-2 cursor-pointer ${activeTab === category
              ? "primary"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {category || "ไม่พบหมวดหมู่"}
          </Button>
        ))}
      </div>

      {/* Spacer when tabs are fixed */}
      {isFixed && <div className="h-16" />}

      {/* Gallery*/}
      <div className="grid gap-2">
        {filteredData.map((item, index) => (
          <div key={index} className={`${index % 3 === 0 ? "col-span-2" : "col-span-2 md:col-span-1"}`}>
            {item.url && (
              <div className="relative aspect-square">
                <Image
                  src={item.url}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          ไม่พบรูปภาพในหมวดหมู่นี้
        </div>
      )}
    </>
  );
};

export default TabGallery;
