'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { Button } from "@/components/ui/button"


interface GalleryImageProps {
  galleryImages: (string | null)[];
  slug: string;
}

const GalleryImage = ({ galleryImages, slug }: GalleryImageProps) => {
  const displayImages = galleryImages.slice(0, 5).filter(Boolean) as string[];

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
          <div className="basis-1/2">
            {galleryImages[0] && (
              <div className="flex-col h-full">
                <Image
                  src={galleryImages[0]}
                  alt="Gallery image 1"
                  className="object-cover w-full h-full max-h-[400px]"
                  width={500}
                  height={400}
                />
              </div>
            )}
          </div>
          <div className="basis-1/2 flex flex-col gap-2">
            <div className="flex flex-col ">
              <div className="flex flex-row gap-2">
                {galleryImages[1] && (
                  <div className="flex-col basis-1/2">
                    <Image
                      src={galleryImages[1]}
                      alt="Gallery image 2"
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {galleryImages[2] && (
                  <div className="flex-col basis-1/2">
                    <Image
                      src={galleryImages[2]}
                      alt="Gallery image 3"
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col ">
              <div className="flex flex-row gap-2">
                {galleryImages[3] && (
                  <div className="flex-col basis-1/2">
                    <Image
                      src={galleryImages[3]}
                      alt="Gallery image 4"
                      className="object-cover w-full max-h-[196px]"
                      width={500}
                      height={196}
                    />
                  </div>
                )}
                {galleryImages[4] && (
                  <div className="flex-col basis-1/2">
                    <div className="relative h-full">
                      <Image
                        src={galleryImages[4]}
                        alt="Gallery image 5"
                        className="object-cover w-full max-h-[196px]"
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

export default GalleryImage;