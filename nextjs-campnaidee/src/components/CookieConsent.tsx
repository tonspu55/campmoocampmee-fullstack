'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // ตรวจสอบว่าผู้ใช้เคยยอมรับ cookie แล้วหรือยัง
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#2C2C2C] text-white">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 ">
          {/* ข้อความ */}
          <div className="lg:flex-1 text-sm md:text-base">
            <p>
              เว็บไซต์นี้มีการใช้คุกกี้เพื่อการปรับปรุงการใช้บริการออนไลน์ของท่าน โดยเราจะใช้คุกกี้เมื่อท่านเข้ามาหน้าเว็บไซต์.
              คุณสามารถอ่านรายละเอียดเพิ่มเติมได้ที่&nbsp;
              <Link
                href="/cookie-policy"
                className="text-white underline font-medium"
              >
                นโยบายการใช้คุกกี้
              </Link>
            </p>
          </div>
          {/* ปุ่มยอมรับ */}
          <div className="lg:flex-none flex flex-row justify-end gap-2">
            <Button
              onClick={handleAccept}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              ยอมรับ
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-white "
              aria-label="ปิด"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
