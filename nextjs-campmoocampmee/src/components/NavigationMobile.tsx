'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PhoneCall, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SocialContactLinks } from '@/types/social';

interface NavigationMobileProps {
  socialContactLinks?: SocialContactLinks;
}

const NavigationMobile = ({ socialContactLinks }: NavigationMobileProps) => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const endElement = document.querySelector('.end-page-detection');
    if (!endElement) return;

    // ซ่อนแถบเมื่อ sentinel ท้ายหน้าเข้ามาในจอ (เผื่อ buffer 50px)
    // rootMargin ด้านบนเผื่อไว้เยอะ เพื่อให้ยังนับว่า "ถึงท้ายหน้า" แม้ scroll เลยไปแล้ว
    const observer = new IntersectionObserver(
      ([entry]) => setIsAtBottom(entry.isIntersecting),
      { rootMargin: '9999px 0px -50px 0px' },
    );

    observer.observe(endElement);
    return () => observer.disconnect();
  }, []);

  if (!socialContactLinks) return null;

  const { phone, googleMapNavigation } = socialContactLinks;
  if (!phone && !googleMapNavigation) return null;

  return (
    <div
      className={`${
        isAtBottom
          ? 'relative hidden'
          : 'fixed bottom-0 left-0 right-0 z-10 w-full'
      } lg:hidden bg-white dark:bg-background transition-all px-2`}
    >
      <div className="py-2 flex flex-row gap-2 items-center">
        <div className="basis-1/2">
          {phone && (
            <Button
              variant="default"
              className="flex items-center w-full"
              asChild
            >
              <Link href={`tel:${phone}`}>
                <PhoneCall className="w-6 h-6 " />
                โทรติดต่อที่พัก
              </Link>
            </Button>
          )}
        </div>
        <div className="basis-1/2">
          {googleMapNavigation && (
            <Button
              variant="default"
              className="flex items-center w-full"
              asChild
            >
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={googleMapNavigation}
              >
                <Navigation className="w-6 h-6 " />
                นำทางไปที่พัก
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationMobile;
