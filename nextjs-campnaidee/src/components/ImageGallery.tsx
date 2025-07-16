'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState, useEffect } from 'react';



interface ImageGalleryProps {
  ImageGallery: (string | null)[];
  slug: string;

}

const ImageGallery = ({ ImageGallery, slug }: ImageGalleryProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const displayImages = ImageGallery.slice(0, 5).filter(Boolean) as string[];

  useEffect(() => {
    // Simulate loading time for 1 second
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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
      {/* Mobile View - Swiper */}
      <div className="md:hidden">
        <Swiper
          spaceBetween={10}
          slidesPerView={1.1}
          className="h-[300px] "
        >
          {displayImages.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full">
                <Image
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover "
                />
                {index === 4 && (
                  <div className="absolute bottom-0 right-0">
                    <div className="flex flex-col items-end pr-2">
                      <Button asChild>
                        <Link
                          href={`/land/${slug}/gallery`}
                          className="text-sm text-center absolute bottom-0 right-0 m-2 p-2"
                        >
                          ดูรูปภาพทั้งหมด
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>


      </div>

      {/* Desktop View - Grid Layout */}
      <div className="hidden md:block">
        <div className="flex flex-row gap-2 items-stretch max-h-[400px]">
          <div className="basis-1/2 ">
            {ImageGallery[0] && (
              <div className="flex-col h-full ">
                <Image
                  src={ImageGallery[0]}
                  alt="Gallery image 1"
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
                  <div className="flex-col basis-1/2">
                    <Image
                      src={ImageGallery[1]}
                      alt="Gallery image 2"
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {ImageGallery[2] && (
                  <div className="flex-col basis-1/2">
                    <Image
                      src={ImageGallery[2]}
                      alt="Gallery image 3"
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
                  <div className="flex-col basis-1/2">
                    <Image
                      src={ImageGallery[3]}
                      alt="Gallery image 4"
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {ImageGallery[4] && (
                  <div className="flex-col basis-1/2">
                    <div className="relative h-full">
                      <Image
                        src={ImageGallery[4]}
                        alt="Gallery image 5"
                        className="object-cover w-full max-h-[196px] rounded-br-xl"
                        width={500}
                        height={196}
                      />
                      <Button asChild>
                        <Link
                          href={`/land/${slug}/gallery`}
                          className="text-sm text-center absolute bottom-0 right-0 m-2 p-2"
                        >
                          ดูรูปภาพทั้งหมด
                        </Link>
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