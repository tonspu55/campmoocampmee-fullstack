'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhoneCall } from "lucide-react";
import { MessageCircleMore } from "lucide-react";
import { Button } from '@/components/ui/button';

type SocialContactLinks = {
  facebook?: string;
  line?: string;
  instagram?: string;
  googleMap?: string;
  phone?: string;
}

interface ContactSocialLinkProps {
  socialContactLinks: SocialContactLinks;
}

const NavigationMobile = ({ socialContactLinks }: ContactSocialLinkProps) => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const endElement = document.querySelector('.end-page-detection');
      if (endElement) {
        const endElementRect = endElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // ตรวจสอบว่า scroll ถึง end-page-detection หรือไม่ (เพิ่ม buffer เล็กน้อย)
        const isAtEndElement = endElementRect.top <= windowHeight - 50;
        setIsAtBottom(isAtEndElement);
      }
    };

    // ใช้ throttle เพื่อลดการเรียก handleScroll บ่อยเกินไป
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // เรียกครั้งแรกเพื่อตรวจสอบ initial state

    return () => {
      // Clean up event listener
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  return (
    <div className={`${isAtBottom
      ? 'relative hidden'
      : 'fixed bottom-0 left-0 right-0 z-50 w-full'
      } lg:hidden bg-white dark:bg-[var(--background)] transition-all px-2`}>
      <div className='py-2 flex flex-row gap-2 items-center'>
        <div className="basis-1/2">
          {socialContactLinks.phone && (
            <Button variant="default" className="flex items-center w-full">
              <PhoneCall className='w-6 h-6 ' />
              <Link href={`tel:${socialContactLinks.phone}`}>
                จองที่พัก
              </Link>
            </Button>
          )}
        </div>
        <div className="basis-1/2">
          {socialContactLinks.facebook && (
            <Button variant="default" className="flex items-center w-full">
              <MessageCircleMore className='w-6 h-6 ' />
              <Link target='_blank' href={`${socialContactLinks.facebook}`}>
                จองที่พักผ่านเพจ
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default NavigationMobile;

