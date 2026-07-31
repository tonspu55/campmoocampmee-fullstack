"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { galleryImageAnchorId, type ImageGalleryItem } from "@/types/gallery";

/** จำนวนรูปพรีวิวสูงสุดที่โชว์บนหน้า land */
const MAX_PREVIEW_IMAGES = 5;

interface ImageGalleryProps {
  images: ImageGalleryItem[];
  slug: string;
}

const imageAlt = (item: ImageGalleryItem, index: number) =>
  item.alt ||
  (item.title
    ? `${item.title} รูปที่ ${index + 1}`
    : `Gallery image ${index + 1}`);

interface PreviewTileProps {
  item: ImageGalleryItem;
  index: number;
  onOpen: () => void;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  imageClassName?: string;
}

const PreviewTile = ({
  item,
  index,
  onOpen,
  width,
  height,
  sizes,
  className,
  imageClassName,
}: PreviewTileProps) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={`ดูรูปที่ ${index + 1} แบบเต็ม`}
    className={cn(
      "focus-visible:ring-ring block cursor-pointer focus-visible:ring-2 focus-visible:outline-none",
      className,
    )}
  >
    <Image
      src={item.url}
      alt={imageAlt(item, index)}
      width={width}
      height={height}
      sizes={sizes}
      priority={index === 0}
      className={cn("object-cover", imageClassName)}
    />
  </button>
);

const ImageGallery = ({ images, slug }: ImageGalleryProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const displayImages = images.slice(0, MAX_PREVIEW_IMAGES);
  const router = useRouter();

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // ส่งรูปที่คลิกไปหน้าอัลบั้มผ่าน hash — refresh/แชร์ลิงก์แล้วยังไปรูปเดิม
  const openGallery = (item?: ImageGalleryItem) => {
    const hash = item ? `#${galleryImageAnchorId(item.key)}` : "";
    router.push(`/land/${slug}/gallery${hash}`);
  };

  if (displayImages.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground flex h-75 w-full items-center justify-center md:h-100 md:rounded-xl">
        ยังไม่มีรูปภาพของที่พักนี้
      </div>
    );
  }

  const viewAllButton = (className: string) => (
    <Button onClick={() => openGallery()} className={className}>
      ดูรูปภาพทั้งหมด
    </Button>
  );

  return (
    <div>
      {/* Mobile View - Embla Carousel */}
      <div className="relative md:hidden">
        <Carousel setApi={setCarouselApi} opts={{ loop: false }}>
          <CarouselContent className="ml-0">
            {displayImages.map((item, index) => (
              <CarouselItem key={item.key} className="pl-0">
                <div className="relative h-75">
                  <button
                    type="button"
                    onClick={() => openGallery(item)}
                    aria-label={`ดูรูปที่ ${index + 1} แบบเต็ม`}
                    className="absolute inset-0 cursor-pointer"
                  >
                    <Image
                      src={item.url}
                      alt={imageAlt(item, index)}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-cover"
                    />
                  </button>
                  {index === displayImages.length - 1 &&
                    viewAllButton(
                      "absolute right-0 bottom-3 m-2 p-2 text-[12px]",
                    )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Pagination dots */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-10 flex justify-center gap-1.5">
          {displayImages.map((item, i) => (
            <div
              key={item.key}
              className={cn(
                "h-2 rounded-full bg-white transition-all",
                currentSlide === i ? "w-3 opacity-100" : "w-2 opacity-70",
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:block md:px-2">
        <div className="flex max-h-100 flex-row items-stretch gap-2">
          <div className="basis-1/2">
            {displayImages[0] && (
              <PreviewTile
                item={displayImages[0]}
                index={0}
                onOpen={() => openGallery(displayImages[0])}
                width={500}
                height={400}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-full w-full"
                imageClassName="h-full max-h-100 w-full rounded-tl-xl rounded-bl-xl"
              />
            )}
          </div>
          <div className="flex basis-1/2 flex-col gap-2">
            <div className="flex flex-row gap-2">
              {displayImages[1] && (
                <PreviewTile
                  item={displayImages[1]}
                  index={1}
                  onOpen={() => openGallery(displayImages[1])}
                  width={500}
                  height={196}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="basis-1/2"
                  imageClassName="max-h-49 w-full"
                />
              )}
              {displayImages[2] && (
                <PreviewTile
                  item={displayImages[2]}
                  index={2}
                  onOpen={() => openGallery(displayImages[2])}
                  width={500}
                  height={196}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="basis-1/2"
                  imageClassName="max-h-49 w-full rounded-tr-xl"
                />
              )}
            </div>
            <div className="flex flex-row gap-2">
              {displayImages[3] && (
                <PreviewTile
                  item={displayImages[3]}
                  index={3}
                  onOpen={() => openGallery(displayImages[3])}
                  width={500}
                  height={196}
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="basis-1/2"
                  imageClassName="max-h-49 w-full"
                />
              )}
              {displayImages[4] && (
                <div className="relative basis-1/2">
                  <PreviewTile
                    item={displayImages[4]}
                    index={4}
                    onOpen={() => openGallery(displayImages[4])}
                    width={500}
                    height={196}
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="h-full w-full"
                    imageClassName="max-h-49 w-full rounded-br-xl"
                  />
                  {viewAllButton(
                    "absolute right-0 bottom-0 m-2 p-2 text-center text-sm",
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;
