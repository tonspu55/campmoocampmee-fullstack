'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type SanityDocument } from 'next-sanity';
import { urlFor } from '@/sanity/client';
import { X } from 'lucide-react';

interface CampInfoCardProps {
  camp: SanityDocument;
  onClose: () => void;
}

/**
 * การ์ดรายละเอียดแคมป์สำหรับ popup บนแผนที่ (desktop)
 * หมายเหตุ: Leaflet popup wrapper (padding/radius/พื้นหลัง) ถูก override ใน globals.css
 */
export default function CampInfoCard({ camp, onClose }: CampInfoCardProps) {
  const imageUrl = camp.thumbnail
    ? urlFor(camp.thumbnail).width(440).height(248).url()
    : null;

  return (
    <div className="relative w-55">
      <Link href={`/land/${camp.slug?.current}`} className="block">
        {/* Image */}
        <div className="relative w-full aspect-video bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={camp.title || 'Camp'}
              fill
              className="object-cover"
              sizes="220px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">ไม่มีรูปภาพ</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 py-2.5">
          <h3 className="text-sm font-semibold line-clamp-1 text-gray-900 dark:text-white">
            {camp.title}
          </h3>

          {camp.address?.province && (
            <p className="text-xs text-gray-500 dark:text-gray-400  line-clamp-1">
              {camp.address.district && `${camp.address.district}, `}
              {camp.address.province}
            </p>
          )}

          {camp.otherBenefits?.priceOfStay && (
            <p className="text-sm mt-1!">
              <span className="font-semibold text-gray-900 dark:text-white">
                ฿{camp.otherBenefits.priceOfStay}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {' '}
                / คน / คืน
              </span>
            </p>
          )}
        </div>
      </Link>

      {/* Close button — ใช้ปุ่มของเราเองแทน × default ของ Leaflet (closeButton={false}) */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        aria-label="ปิด"
      >
        <X className="w-3 h-3 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}
