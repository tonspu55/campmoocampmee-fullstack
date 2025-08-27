"use client";

import { useEffect, useState } from 'react';
import TabGallery from './TabGallery';
import { useGalleryStore } from '@/lib/store';
import type { GalleryItem } from "@/types/gallery";

// ใช้ type เดียวกับ TabGallery
interface GalleryWithInitialImageProps {
  dataGallery: GalleryItem[];
}

const GalleryWithInitialImage = ({ dataGallery }: GalleryWithInitialImageProps) => {
  const [initialImageIndex, setInitialImageIndex] = useState<number | undefined>(undefined);
  const selectedImageIndex = useGalleryStore((state) => state.selectedImageIndex);
  const setSelectedImageIndex = useGalleryStore((state) => state.setSelectedImageIndex);

  useEffect(() => {
    // Use the selected image index from Zustand store
    if (selectedImageIndex !== undefined) {
      setInitialImageIndex(selectedImageIndex);
      // Clear the store after using it
      setSelectedImageIndex(undefined);
    }
  }, [selectedImageIndex, setSelectedImageIndex]);

  const handleTabChange = () => {
    // Reset initialImageIndex when tab changes
    setInitialImageIndex(undefined);
  };

  return <TabGallery dataGallery={dataGallery} initialImageIndex={initialImageIndex} onTabChange={handleTabChange} />;
};

export default GalleryWithInitialImage;
