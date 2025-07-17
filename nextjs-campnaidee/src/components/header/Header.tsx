"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher";
import { LogoSwitcher } from "@/components/header/LogoSwitcher";
import { AlignJustify, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollStore } from "@/lib/store";

interface NavLinkProps {
  path: string;
  children: ReactNode;
}

interface NavLinkMobileProps {
  path: string;
  children: ReactNode;
  onCloseNav: () => void;
}

const NavLink = ({ path, children }: NavLinkProps) => {
  const pathname = usePathname();
  const isScrolled = useScrollStore((state) => state.isScrolled);
  const [mounted, setMounted] = useState(false);
  // const isExternal = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('www.');

  useEffect(() => {
    setMounted(true);
    // Clean up function to reset mounted state
    return () => {
      setMounted(false);
    };
  }, []);

  // เช็คว่าอยู่ที่หน้าหลักและไม่ได้ scroll (เฉพาะเมื่อ mounted แล้ว)
  const isHomepageTop = mounted && pathname === "/" && !isScrolled;
  const textColorWhite = isHomepageTop ? "text-white" : "";

  // if (isExternal) {
  //   return (
  //     <a
  //       className={`hover:opacity-75 font-medium ${textColorWhite}`}
  //       href={path.startsWith('www.') ? `https://${path}` : path}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //     >
  //       {children}
  //     </a>
  //   );
  // }

  return (
    <Link
      className={`${pathname === path ? "border-b-2 border-[#085953]" : ""
        } hover:opacity-75 font-medium ${textColorWhite}`}
      href={path}
    >
      {children}
    </Link>
  );
};

const NavLinkMobile = ({ path, children, onCloseNav }: NavLinkMobileProps) => {
  const pathname = usePathname();
  // const isExternal = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('www.');

  // if (isExternal) {
  //   return (
  //     <a
  //       className="hover:opacity-75 font-medium"
  //       href={path.startsWith('www.') ? `https://${path}` : path}
  //       target="_blank"
  //       rel="noopener noreferrer"
  //       onClick={onCloseNav}
  //     >
  //       {children}
  //     </a>
  //   );
  // }

  return (
    <Link
      className={pathname === path ? " text-[#085953]" : ""}
      href={path}
      onClick={onCloseNav}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isScrolled = useScrollStore((state) => state.isScrolled);
  const setIsScrolled = useScrollStore((state) => state.setIsScrolled);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);


    return () => {
      // Clean up 
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      setMounted(false);
    };
  }, [setIsScrolled]);

  const menuClasses = useMemo(() => {
    if (isOpen) {
      return [
        "flex",
        "absolute",
        "top-[70px]",
        "w-[100%]",
        "gap-2",
        "flex-col",
        "right-0",
      ].join(" ");
    } else {
      return [
        "hidden",
        "md:flex",
        "md:flex-1",
        "md:items-center",
        "md:justify-center",
        "md:gap-x-8",
      ].join(" ");
    }
  }, [isOpen]);

  return (
    <nav
      className={`flex items-center fixed top-0 left-0 right-0 z-50 h-[70px]  ${mounted && isScrolled ? 'bg-white dark:bg-[var(--background)]' : 'bg-transparent'
        }`}
    >
      <div className="container mx-auto flex items-center max-w-6xl px-2">
        <LogoSwitcher />
        <div className={`${mounted && isScrolled ? 'bg-white dark:bg-[var(--background)]' : 'bg-transparent'} ${menuClasses}`} >
          {isMobileView ? (
            <div className="bg-white dark:bg-[var(--background)] px-2 py-4">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-2">
                  <NavLinkMobile
                    onCloseNav={() => setIsOpen(false)}
                    path="/"
                  >
                    หน้าหลัก
                  </NavLinkMobile>
                  <NavLinkMobile
                    onCloseNav={() => setIsOpen(false)}
                    path="/contact"
                  >
                    ติดต่อขอลงข้อมูล
                  </NavLinkMobile>
                </div>
                <div className="flex flex-col items-end">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          ) : (
            <>
              <NavLink path="/">หน้าหลัก</NavLink>
              <NavLink path="/contact">ติดต่อขอลงข้อมูล</NavLink>
            </>
          )}
        </div>
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-end">
          <ThemeSwitcher />
        </div>
        <div className="flex items-center md:hidden">
          <Button
            className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer "
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {!isOpen ? <AlignJustify /> : <X />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;
