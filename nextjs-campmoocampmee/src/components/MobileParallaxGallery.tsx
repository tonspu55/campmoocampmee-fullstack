'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import ImageGallery, { type ImageGalleryItem } from '@/components/ImageGallery'

interface MobileParallaxGalleryProps {
  ImageGallery: ImageGalleryItem[]
  slug: string
}

export default function MobileParallaxGallery({ ImageGallery: galleryData, slug }: MobileParallaxGalleryProps) {
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
    let rafId: number
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(handleScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [handleScroll])

  return (
    <div className="md:hidden">
      <div
        ref={galleryRef}
        className={isFixed ? 'fixed top-15 left-0 right-0 z-0' : 'absolute top-0 left-0 right-0 z-0'}
      >
        <ImageGallery ImageGallery={galleryData} slug={slug} />
      </div>
      <div className="h-75" />
    </div>
  )
}
