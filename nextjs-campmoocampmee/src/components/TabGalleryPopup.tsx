"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { GalleryItem } from "@/types/gallery";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

interface TabGalleryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryItem[];
  currentIndex: number;
  postTitle?: string;
}

const TabGalleryPopup = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  postTitle,
}: TabGalleryPopupProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(currentIndex);

  // Jump to currentIndex when popup opens or API becomes ready
  useEffect(() => {
    if (isOpen && carouselApi) {
      carouselApi.scrollTo(currentIndex, false);
      setCurrentSlide(currentIndex);
    }
  }, [isOpen, carouselApi, currentIndex]);

  // Track slide changes from Embla
  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // Keyboard navigation
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          carouselApi?.scrollPrev();
          break;
        case "ArrowRight":
          carouselApi?.scrollNext();
          break;
      }
    },
    [isOpen, onClose, carouselApi],
  );

  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.addEventListener("keydown", handleKeyPress);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyPress);
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isOpen, handleKeyPress]);

  const isVideo = (item: GalleryItem) => item._type === "video" && item.embedCode;

  const renderVideoEmbed = (item: GalleryItem) => {
    if (!item.embedCode) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <p className="text-white">ไม่พบโค้ดวิดีโอ</p>
        </div>
      );
    }
    return (
      <div
        className="video-embed-container w-full h-full flex items-center justify-center max-w-[90%] lg:max-w-[50%]"
        style={{ maxHeight: "50%" }}
      >
        <div
          dangerouslySetInnerHTML={{ __html: item.embedCode }}
          className="w-full h-full"
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="default"
        size="icon"
        className="absolute top-4 right-4 z-20 text-white cursor-pointer rounded-full"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Carousel */}
      <Carousel
        setApi={setCarouselApi}
        opts={{ loop: false }}
        className="w-full h-full"
      >
        <CarouselContent className="ml-0">
          {images.map((item, index) => (
            <CarouselItem key={item.url || index} className="pl-0">
              <div className="flex items-center justify-center h-screen">
                {isVideo(item) ? (
                  renderVideoEmbed(item)
                ) : item.url ? (
                  <div className="relative w-full max-w-full md:max-w-[80vw] h-[80vh]">
                    <Image
                      src={item.url}
                      alt={item.alt || postTitle || `Gallery image ${index + 1}`}
                      fill
                      className="object-contain"
                      priority={Math.abs(index - currentSlide) <= 1}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">ไม่พบข้อมูล</p>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Previous button */}
        <CarouselPrevious
          variant="default"
          className="left-4 cursor-pointer max-md:left-1/2 max-md:-translate-x-full max-md:top-auto max-md:bottom-20 max-md:translate-y-0 max-md:-ml-1.25"
        />

        {/* Next button */}
        <CarouselNext
          variant="default"
          className="right-4 cursor-pointer max-md:right-1/2 max-md:translate-x-full max-md:top-auto max-md:bottom-20 max-md:translate-y-0 max-md:-mr-1.25"
        />
      </Carousel>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded z-20 pointer-events-none">
        {currentSlide + 1} / {images.length}
      </div>

      {/* Background overlay to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default TabGalleryPopup;
