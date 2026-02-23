"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "@/app/homepage.module.css";
import SearchBox from "@/components/SearchBox";

export default function HeroBanner() {
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
        <div className="flex flex-col items-center justify-center text-center h-full mt-[-20px] lg:justify-center lg:items-center lg:text-left lg:flex-row lg:pl-[0px] lg:mt-[-20px]">
          <div className="w-[50%] flex-none"></div>
          <div ref={contentRef} className="w-full lg:w-[50%] gap-4">
            <h1 className="text-xl lg:text-4xl font-bold text-white">
              หาลานกางเต็นท์
              <br />
              ที่พักแคมป์ปิ้งทั่วไทย
            </h1>
            {/* <Button asChild className="cursor-pointer mt-2 lg:mt-4" variant="default">
              <Link href="/contact">
                ติดต่อลงข้อมูล
              </Link>
            </Button> */}
            <div className="flex flex-col items-center lg:items-start mt-2 lg:mt-4">
              <div className="w-[250px] lg:w-[350px]">
                <SearchBox />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
