'use client';

import Image from 'next/image';
import Link from 'next/link';
import { type SanityDocument } from 'next-sanity';
import { urlFor } from '@/sanity/client';
import { X } from 'lucide-react';

interface MobileCampCardProps {
  camp: SanityDocument;
  onClose: () => void;
}

/**
 * การ์ดรายละเอียดแคมป์แบบแนวนอน สำหรับแสดงล่างจอบน mobile
 * (ใช้แทน popup ของแผนที่ซึ่งเปิดเฉพาะ desktop)
 */
export default function MobileCampCard({ camp, onClose }: MobileCampCardProps) {
  const imageUrl = camp.thumbnail
    ? urlFor(camp.thumbnail).width(192).height(192).url()
    : null;

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <Link href={`/land/${camp.slug?.current}`} className="flex items-stretch">
        {/* Image */}
        <div className="relative w-24 h-24 shrink-0 bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={camp.title || 'Camp'}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 text-xs">ไม่มีรูป</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-3 pr-10 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">
            {camp.title}
          </h3>

          {camp.address?.province && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
              {camp.address.district && `${camp.address.district}, `}
              {camp.address.province}
            </p>
          )}

          {camp.otherBenefits?.priceOfStay && (
            <p className="text-sm mt-1">
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

      {/* Close button — อยู่ใน <Link> ระดับพี่น้อง จึงต้องกัน event ไม่ให้ไปโดน navigation */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        aria-label="ปิด"
      >
        <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>
    </div>
  );
}
