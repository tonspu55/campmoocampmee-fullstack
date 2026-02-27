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

type ImageGalleryItem = {
  url: string;
  alt: string | null;
};

interface ImageGalleryProps {
  ImageGallery: ImageGalleryItem[];
  slug: string;
}

const ImageGallery = ({ ImageGallery, slug }: ImageGalleryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  // Limit to 5 images for the gallery preview
  const displayImages = ImageGallery.slice(0, 5);
  // Zustand store to set selected image index
  const setSelectedImageIndex = useGalleryStore(
    (state) => state.setSelectedImageIndex,
  );
  const router = useRouter();

  const handleImageClick = (index: number) => {
    // Set the selected index using React state via context
    setSelectedImageIndex(index);
    // Navigate to gallery page
    router.push(`/land/${slug}/gallery`);
  };

  const handleViewAllClick = () => {
    // Navigate to gallery page without setting index
    router.push(`/land/${slug}/gallery`);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    });
  }, [carouselApi]);

  // Show loading state if internal loading or external loading is true
  if (isLoading) {
    return (
      <div>
        {/* Mobile View - Loading */}
        <div className="md:hidden">
          <div className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>

        {/* Desktop View - Loading */}
        <div className="hidden md:block">
          <div className="flex flex-row gap-2 items-stretch max-h-[400px]">
            <div className="basis-1/2">
              <Skeleton className="h-full w-full rounded-tl-xl rounded-bl-xl" />
            </div>
            <div className="basis-1/2 flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full" />
                </div>
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full rounded-tr-xl" />
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full" />
                </div>
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full rounded-br-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no images available, show skeleton as fallback
  if (displayImages.length === 0) {
    return (
      <div>
        {/* Mobile View - No Images */}
        <div className="md:hidden">
          <div className="h-[300px]">
            <Skeleton className="h-full w-full " />
          </div>
        </div>

        {/* Desktop View - No Images */}
        <div className="hidden md:block">
          <div className="flex flex-row gap-2 items-stretch max-h-[400px]">
            <div className="basis-1/2">
              <Skeleton className="h-full w-full rounded-tl-xl rounded-bl-xl" />
            </div>
            <div className="basis-1/2 flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full" />
                </div>
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full rounded-tr-xl" />
                </div>
              </div>
              <div className="flex flex-row gap-2">
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full" />
                </div>
                <div className="basis-1/2">
                  <Skeleton className="h-[196px] w-full rounded-br-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Mobile View - Embla Carousel */}
      <div className="md:hidden">
        <Carousel setApi={setCarouselApi} opts={{ loop: false }}>
          <CarouselContent className="ml-0">
            {displayImages.map((imageItem, index) => (
              <CarouselItem key={index} className="pl-0">
                <div
                  className="relative h-75 cursor-pointer"
                  onClick={() => handleImageClick(index)}
                >
                  <Image
                    src={imageItem.url}
                    alt={imageItem.alt || `Gallery image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {/* Show "View All" button on the last image */}
                  {index === displayImages.length - 1 && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewAllClick();
                      }}
                      className="text-[12px] absolute bottom-3  right-0 m-2 p-2"
                    >
                      ดูรูปภาพทั้งหมด
                    </Button>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
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
        </Carousel>
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:block md:px-2">
        <div className="flex flex-row gap-2 items-stretch max-h-[400px]">
          <div className="basis-1/2 ">
            {ImageGallery[0] && (
              <div
                className="flex-col h-full cursor-pointer"
                onClick={() => handleImageClick(0)}
              >
                <Image
                  src={ImageGallery[0].url}
                  alt={ImageGallery[0].alt || "Gallery image 1"}
                  className="object-cover w-full h-full max-h-[400px] rounded-tl-xl rounded-bl-xl"
                  width={500}
                  height={400}
                />
              </div>
            )}
          </div>
          <div className="basis-1/2 flex flex-col gap-2">
            <div className="flex flex-col ">
              <div className="flex flex-row gap-2">
                {ImageGallery[1] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => handleImageClick(1)}
                  >
                    <Image
                      src={ImageGallery[1].url}
                      alt={ImageGallery[1].alt || "Gallery image 2"}
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {ImageGallery[2] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => handleImageClick(2)}
                  >
                    <Image
                      src={ImageGallery[2].url}
                      alt={ImageGallery[2].alt || "Gallery image 3"}
                      className="object-cover w-full max-h-[196px] rounded-tr-xl "
                      width={500}
                      height={196}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col ">
              <div className="flex flex-row gap-2">
                {ImageGallery[3] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => handleImageClick(3)}
                  >
                    <Image
                      src={ImageGallery[3].url}
                      alt={ImageGallery[3].alt || "Gallery image 4"}
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {ImageGallery[4] && (
                  <div
                    className="flex-col basis-1/2 cursor-pointer"
                    onClick={() => handleImageClick(4)}
                  >
                    <div className="relative h-full">
                      <Image
                        src={ImageGallery[4].url}
                        alt={ImageGallery[4].alt || "Gallery image 5"}
                        className="object-cover w-full max-h-[196px] rounded-br-xl"
                        width={500}
                        height={196}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering handleImageClick
                          handleViewAllClick();
                        }}
                        className="text-sm text-center absolute bottom-0 right-0 m-2 p-2 cursor-pointer hover:cursor-pointer"
                        style={{ cursor: "pointer" }}
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
