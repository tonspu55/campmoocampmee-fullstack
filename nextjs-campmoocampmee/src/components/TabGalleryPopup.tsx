"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import VideoEmbed from "./VideoEmbed";
import { isVideoItem, type GalleryItem } from "@/types/gallery";

/** จำนวนสไลด์รอบๆ ที่โหลดสื่อจริง (นอกช่วงนี้เว้นไว้ก่อน) */
const PRELOAD_RANGE = 1;

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

  // กระโดดไปสไลด์ที่คลิกมาเมื่อ popup เปิด (หรือเมื่อ Embla พร้อม)
  useEffect(() => {
    if (isOpen && carouselApi) {
      carouselApi.scrollTo(currentIndex, true);
      setCurrentSlide(currentIndex);
    }
  }, [isOpen, carouselApi, currentIndex]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // คลิกพื้นที่ว่างรอบรูป (ไม่ใช่ตัวรูป/วิดีโอ) เพื่อปิด
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        onKeyDown={(e) => {
          // Carousel จัดการลูกศรเองอยู่แล้วเมื่อ focus อยู่ในตัวมัน
          if (e.defaultPrevented) return;
          if (e.key === "ArrowLeft") carouselApi?.scrollPrev();
          if (e.key === "ArrowRight") carouselApi?.scrollNext();
        }}
        className="inset-0 top-0 left-0 block h-full w-full max-w-full translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 bg-black p-0 shadow-none sm:max-w-full"
      >
        <DialogTitle className="sr-only">
          {postTitle ? `อัลบั้มรูปภาพ ${postTitle}` : "อัลบั้มรูปภาพ"}
        </DialogTitle>

        <Button
          onClick={onClose}
          variant="default"
          size="icon"
          aria-label="ปิดอัลบั้ม"
          className="absolute top-4 right-4 z-20 rounded-full"
        >
          <X className="h-4 w-4" />
        </Button>

        <Carousel
          setApi={setCarouselApi}
          opts={{ loop: false }}
          className="h-full w-full"
        >
          <CarouselContent className="ml-0">
            {images.map((item, index) => {
              const isNearby = Math.abs(index - currentSlide) <= PRELOAD_RANGE;

              return (
                <CarouselItem key={item._key} className="pl-0">
                  <div
                    className="flex h-screen items-center justify-center"
                    onClick={handleBackdropClick}
                  >
                    {isVideoItem(item) ? (
                      // โหลด iframe เฉพาะสไลด์ใกล้ๆ ไม่งั้นเปิด popup ทีเดียว
                      // ยิง embed ทุกตัวพร้อมกัน
                      isNearby ? (
                        <VideoEmbed
                          item={item}
                          className="max-h-[80vh] max-w-[90%] lg:max-w-[50%]"
                        />
                      ) : null
                    ) : (
                      <div className="relative h-[80vh] w-full max-w-full md:max-w-[80vw]">
                        <Image
                          src={item.fullUrl}
                          alt={item.alt || `${postTitle ?? "Gallery"} รูปที่ ${index + 1}`}
                          fill
                          sizes="100vw"
                          loading={isNearby ? "eager" : "lazy"}
                          className="object-contain"
                        />
                      </div>
                    )}
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          <CarouselPrevious
            variant="default"
            className="left-4 max-md:top-auto max-md:bottom-20 max-md:left-1/2 max-md:-ml-1.25 max-md:translate-y-0 max-md:-translate-x-full"
          />
          <CarouselNext
            variant="default"
            className="right-4 max-md:top-auto max-md:right-1/2 max-md:bottom-20 max-md:-mr-1.25 max-md:translate-x-full max-md:translate-y-0"
          />
        </Carousel>

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded bg-black/50 px-3 py-1 text-white">
          {currentSlide + 1} / {images.length}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TabGalleryPopup;
