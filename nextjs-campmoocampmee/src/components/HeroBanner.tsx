"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "@/app/homepage.module.css";
import SearchBox from "@/components/SearchBox";
import Link from "next/link";
import { TAG_LABELS } from "@/lib/tags";

interface HeroBannerProps {
  availableTags?: string[];
}

export default function HeroBanner({ availableTags = [] }: HeroBannerProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      // Set initial state
      gsap.set(contentRef.current, {
        opacity: 0,
        y: -100,
      });

      // Animate in
      gsap.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.3,
      });
    }
  }, []);

  return (
    <div className={`${styles.homeBg}`}>
      <div className="container mx-auto max-w-6xl px-2 h-full">
        <div className="flex flex-col items-center justify-center text-center h-full    max-lg:mt-5">
          <div ref={contentRef} className="w-full lg:w-[50%] gap-4">
            <h1 className="text-2xl lg:text-4xl font-bold text-white">
              หาลานกางเต็นท์ตรงใจคุณ
            </h1>
            <div className="flex flex-col items-center  mt-2 lg:mt-3">
              <div className="w-full max-w-[330px] lg:max-w-[450px] ">
                <SearchBox />
              </div>
            </div>
            {availableTags.length > 0 && (
              <div className="flex flex-wrap gap-2  mt-2  mx-auto justify-center max-w-[330px]  lg:max-w-[500px] w-full">
                {Object.keys(TAG_LABELS)
                  .filter((tag) => availableTags.includes(tag))
                  .map((tag) => (
                    <Link
                      key={tag}
                      href={`/search?tag=${tag}`}
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors"
                    >
                      {TAG_LABELS[tag]}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
