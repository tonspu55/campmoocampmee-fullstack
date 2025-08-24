"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type GalleryItem = {
  url: string | null;
  category: string | null;
  alt: string | null;
}

interface TabGalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryItem[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
}

const TabGalleryPopup = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrevious
}: TabGalleryPopupProps) => {
  const currentImage = images[currentIndex];

  // Handle keyboard navigation
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        onPrevious();
        break;
      case 'ArrowRight':
        onNext();
        break;
    }
  }, [isOpen, onClose, onNext, onPrevious]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyPress]);

  if (!isOpen || !currentImage?.url) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/100 flex items-center justify-center">
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="default"
        size="icon"
        className="absolute top-4 right-4  z-10 text-white cursor-pointer rounded-full"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Previous button */}
      <Button
        onClick={onPrevious}
        variant="default"
        size="icon"
        className="cursor-pointer absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full max-md:left-1/2 max-md:-translate-x-full max-md:top-auto max-md:bottom-20 max-md:-translate-y-0 max-md:ml-[-5px]"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Next button */}
      <Button
        onClick={onNext}
        variant="default"
        size="icon"
        className="cursor-pointer absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full max-md:right-1/2 max-md:translate-x-full max-md:top-auto max-md:bottom-20 max-md:-translate-y-0 max-md:mr-[-5px]"
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Image container */}
      <div className="relative max-w-[100vw] max-h-[95vh] w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={currentImage.url}
            alt={currentImage.alt || `Gallery image ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Background overlay to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};

export default TabGalleryPopup;