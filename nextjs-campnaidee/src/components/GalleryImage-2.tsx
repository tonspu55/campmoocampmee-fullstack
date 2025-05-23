'use client';

import Image from 'next/image';

interface GalleryImageProps {
  galleryImages: (string | null)[];
}

const GalleryImage = ({ galleryImages }: GalleryImageProps) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Full width */}
      {galleryImages[0] && (
        <div className="w-full">
          <Image
            src={galleryImages[0]}
            alt="Gallery image 1"
            className="aspect-video rounded-xl"
            width={1200}
            height={1200}
          />
        </div>
      )}

      {/* Row 2: Two columns */}
      <div className="grid grid-cols-2 gap-4">
        {galleryImages.slice(1).map((url, index) => (
          url && (
            <div key={index} className="w-full">
              <Image
                src={url}
                alt={`Gallery image ${index + 2}`}
                className="aspect-video rounded-xl"
                width={600}
                height={600}
              />
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default GalleryImage;