"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { useGalleryStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

export type ImageGalleryItem = {
  url: string;
  alt: string | null;
};

interface ImageGalleryProps {
  ImageGallery: ImageGalleryItem[];
  slug: string;
}

function GallerySkeleton() {
  return (
    <div>
      <div className="md:hidden">
        <div className="h-75">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
      <div className="hidden md:block">
        <div className="flex flex-row gap-2 items-stretch max-h-100">
          <div className="basis-1/2">
            <Skeleton className="h-full w-full rounded-tl-xl rounded-bl-xl" />
          </div>
          <div className="basis-1/2 flex flex-col gap-2">
            <div className="flex flex-row gap-2">
              <div className="basis-1/2">
                <Skeleton className="h-49 w-full" />
              </div>
              <div className="basis-1/2">
                <Skeleton className="h-49 w-full rounded-tr-xl" />
              </div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="basis-1/2">
                <Skeleton className="h-49 w-full" />
              </div>
              <div className="basis-1/2">
                <Skeleton className="h-49 w-full rounded-br-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ImageGallery = ({ ImageGallery, slug }: ImageGalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const displayImages = ImageGallery.slice(0, 5);
  const setSelectedImageIndex = useGalleryStore(
    (state) => state.setSelectedImageIndex,
  );
  const router = useRouter();

  const navigateToGallery = (index?: number) => {
    if (index !== undefined) setSelectedImageIndex(index);
    router.push(`/land/${slug}/gallery`);
  };

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  if (displayImages.length === 0) {
    return <GallerySkeleton />;
  }

  return (
    <div>
      {/* Mobile View - Embla Carousel */}
      <div className="md:hidden relative">
        <Carousel setApi={setCarouselApi} opts={{ loop: false }}>
          <CarouselContent className="ml-0">
            {displayImages.map((imageItem, index) => (
              <CarouselItem key={index} className="pl-0">
                <div
                  className="relative h-75 cursor-pointer"
                  onClick={() => navigateToGallery(index)}
                >
                  <Image
                    src={imageItem.url}
                    alt={imageItem.alt || `Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {index === displayImages.length - 1 && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateToGallery();
                      }}
                      className="text-[12px] absolute bottom-3 right-0 m-2 p-2"
                    >
                      ดูรูปภาพทั้งหมด
                    </Button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {/* Pagination dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
          {displayImages.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full bg-white transition-all ${
                currentSlide === i ? "w-3 opacity-100" : "w-2 opacity-70"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:block md:px-2">
        <div className="flex flex-row gap-2 items-stretch max-h-100">
          <div className="basis-1/2">
            {ImageGallery[0] && (
              <div
                className="flex-col h-full cursor-pointer"
                onClick={() => navigateToGallery(0)}
              >
                <Image
                  src={ImageGallery[0].url}
                  alt={ImageGallery[0].alt || "Gallery image 1"}
                  className="object-cover w-full h-full max-h-100 rounded-tl-xl rounded-bl-xl"
                  width={500}
                  height={400}
                />
              </div>
            )}
          </div>
          <div className="basis-1/2 flex flex-col gap-2">
            <div className="flex flex-col">
              <div className="flex flex-row gap-2">
                {ImageGallery[1] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => navigateToGallery(1)}
                  >
                    <Image
                      src={ImageGallery[1].url}
                      alt={ImageGallery[1].alt || "Gallery image 2"}
                      className="object-cover w-full max-h-49"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {ImageGallery[2] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => navigateToGallery(2)}
                  >
                    <Image
                      src={ImageGallery[2].url}
                      alt={ImageGallery[2].alt || "Gallery image 3"}
                      className="object-cover w-full max-h-49 rounded-tr-xl"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-2">
                {ImageGallery[3] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => navigateToGallery(3)}
                  >
                    <Image
                      src={ImageGallery[3].url}
                      alt={ImageGallery[3].alt || "Gallery image 4"}
                      className="object-cover w-full max-h-49"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {ImageGallery[4] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => navigateToGallery(4)}
                  >
                    <div className="relative h-full">
                      <Image
                        src={ImageGallery[4].url}
                        alt={ImageGallery[4].alt || "Gallery image 5"}
                        className="object-cover w-full max-h-49 rounded-br-xl"
                        width={500}
                        height={196}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToGallery();
                        }}
                        className="text-sm text-center absolute bottom-0 right-0 m-2 p-2 cursor-pointer"
                      >
                        ดูรูปภาพทั้งหมด
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
