'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import ImageGallery from '@/components/ImageGallery'
import type { ImageGalleryItem } from '@/types/gallery'

interface MobileParallaxGalleryProps {
  images: ImageGalleryItem[]
  slug: string
}

/**
 * เรนเดอร์ ImageGallery เพียงชุดเดียวสำหรับทุก breakpoint
 * - mobile (< md): ตรึงแกลเลอรีไว้ให้เนื้อหาเลื่อนทับแบบ parallax
 * - desktop (>= md): ปล่อยเป็น static ตาม flow ปกติ (คลาส md:* override)
 */
export default function MobileParallaxGallery({ images, slug }: MobileParallaxGalleryProps) {
  const [isFixed, setIsFixed] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const reviewSection = document.getElementById('review-section')
    if (!reviewSection || !galleryRef.current) return

    const galleryHeight = galleryRef.current.offsetHeight
    const headerHeight = 60
    const reviewSectionTop = reviewSection.getBoundingClientRect().top

    setIsFixed(reviewSectionTop > galleryHeight + headerHeight)
  }, [])

  useEffect(() => {
    // parallax ใช้เฉพาะ mobile — desktop ไม่ต้องผูก scroll listener
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    let rafId = 0

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    const bindScroll = () => {
      window.removeEventListener('scroll', onScroll)
      if (!mediaQuery.matches) return
      window.addEventListener('scroll', onScroll, { passive: true })
      handleScroll()
    }

    bindScroll()
    mediaQuery.addEventListener('change', bindScroll)

    return () => {
      mediaQuery.removeEventListener('change', bindScroll)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [handleScroll])

  return (
    <div>
      <div
        ref={galleryRef}
        className={`${isFixed ? 'fixed top-15' : 'absolute top-0'} left-0 right-0 z-0 md:static md:z-auto`}
      >
        <ImageGallery images={images} slug={slug} />
      </div>
      {/* spacer กันเนื้อหาซ้อนแกลเลอรีที่ถูกตรึงไว้ (mobile เท่านั้น) */}
      <div className="h-75 md:hidden" />
    </div>
  )
}
