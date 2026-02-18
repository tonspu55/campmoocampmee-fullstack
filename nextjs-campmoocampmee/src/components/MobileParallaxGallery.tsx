'use client'

import { useEffect, useState, useRef } from 'react'
import ImageGallery from '@/components/ImageGallery'

type ImageGalleryItem = {
  url: string
  alt: string | null
}

interface MobileParallaxGalleryProps {
  ImageGallery: ImageGalleryItem[]
  slug: string
}

export default function MobileParallaxGallery({ ImageGallery: galleryData, slug }: MobileParallaxGalleryProps) {
  const [isFixed, setIsFixed] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)
  const placeholderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      // หา review section element
      const reviewSection = document.getElementById('review-section')
      if (!reviewSection || !galleryRef.current) return

      const galleryHeight = 300 // ความสูงของ gallery
      const headerHeight = 60 // ความสูงของ header (top-15 = 60px)

      // ตำแหน่งที่ review section เริ่มต้น
      const reviewSectionTop = reviewSection.getBoundingClientRect().top

      // เมื่อ review section มาถึงด้านล่างของ gallery
      // gallery ควรหยุด fixed และ scroll ไปพร้อมกับ content
      if (reviewSectionTop <= galleryHeight + headerHeight) {
        setIsFixed(false)
      } else {
        setIsFixed(true)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // เรียกครั้งแรกเพื่อเช็คตำแหน่งเริ่มต้น

    // ล้าง event listener เมื่อ component ถูก unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);

    }
  }, [])

  return (
    <div className="md:hidden">
      {/* Gallery container */}
      <div
        ref={galleryRef}
        className={`${isFixed ? 'fixed top-15 left-0 right-0 z-0' : 'absolute top-0 left-0 right-0 z-0'}`}
        style={!isFixed ? { position: 'absolute' } : undefined}
      >
        <ImageGallery ImageGallery={galleryData} slug={slug} />
      </div>

      {/* Spacer to maintain layout */}
      <div ref={placeholderRef} className="h-75"></div>
    </div>
  )
}
