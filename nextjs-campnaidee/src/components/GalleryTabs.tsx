"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button"

interface GalleryItem {
  url: string | null;
  category: string | null;
}

interface GalleryTabsProps {
  galleryData: GalleryItem[];
}

const GalleryTabs = ({ galleryData }: GalleryTabsProps) => {
  const categories = [...new Set(galleryData.map((data) => data.category))].filter(Boolean) as string[];
  const allCategories = ["ทั้งหมด", ...categories];

  const [activeTab, setActiveTab] = useState("ทั้งหมด");

  const filteredData = activeTab === "ทั้งหมด"
    ? galleryData
    : galleryData.filter((item) => item.category === activeTab);

  return (
    <>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 ">
        {allCategories.map((category) => (
          <Button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-4 py-2 cursor-pointer ${activeTab === category
              ? "primary"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {category || "ไม่พบหมวดหมู่"}
          </Button>
        ))}
      </div>

      {/* Gallery*/}
      <div className="grid grid-cols-2 gap-2">
        {filteredData.map((item, index) => (
          <div key={index} className={`${index % 3 === 0 ? "col-span-2" : "col-span-1"}`}>
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

export default GalleryTabs;
