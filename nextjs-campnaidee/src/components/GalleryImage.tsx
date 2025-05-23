'use client';

import Image from 'next/image';

interface GalleryImageProps {
  galleryImages: (string | null)[];
}

const GalleryImage = ({ galleryImages }: GalleryImageProps) => {
  return (
    <div className="flex flex-row gap-2 items-stretch">
      <div className="basis-1/2">
        {galleryImages[0] && (
          <div className="flex-col">
            <Image
              src={galleryImages[0]}
              alt="Gallery image 1"
              className="aspect-video"
              width={1200}
              height={1200}
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
                  className="aspect-video"
                  width={1200}
                  height={1200}
                />
              </div>
            )}
            {galleryImages[2] && (
              <div className="flex-col basis-1/2">
                <Image
                  src={galleryImages[2]}
                  alt="Gallery image 3"
                  className="aspect-video"
                  width={1200}
                  height={1200}
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col ">
          <div className="flex flex-row gap-2">
            {galleryImages[1] && (
              <div className="flex-col basis-1/2">
                <Image
                  src={galleryImages[1]}
                  alt="Gallery image 2"
                  className="aspect-video"
                  width={1200}
                  height={1200}
                />
              </div>
            )}
            {galleryImages[2] && (
              <div className="flex-col basis-1/2">
                <Image
                  src={galleryImages[2]}
                  alt="Gallery image 3"
                  className="aspect-video"
                  width={1200}
                  height={1200}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryImage;