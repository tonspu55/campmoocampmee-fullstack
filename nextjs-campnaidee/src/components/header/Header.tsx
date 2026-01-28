"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, ReactNode } from "react";
import { LogoSwitcher } from "@/components/header/LogoSwitcher";
import { AlignJustify, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScrollStore } from "@/lib/store";
import UserDialog from "@/components/UserDialog";

interface NavLinkProps {
  path: string;
  children: ReactNode;
  isHomepageTop?: boolean;
}

interface NavLinkMobileProps {
  path: string;
  children: ReactNode;
  onCloseNav: () => void;
}

const NavLink = ({ path, children, isHomepageTop = false }: NavLinkProps) => {
  const pathname = usePathname();

  return (
    <Link
      className={`
        ${pathname === path ? "border-b-2 border-primary" : ""} 
        hover:opacity-75 font-medium transition-colors duration-200
        ${isHomepageTop ? "text-white" : "text-foreground"}
      `}
      href={path}
    >
      {children}
    </Link>
  );
};

const NavLinkMobile = ({ path, children, onCloseNav }: NavLinkMobileProps) => {
  const pathname = usePathname();

  return (
    <Link
      className={`
        py-2 px-3 rounded-md transition-colors duration-200
        ${pathname === path
          ? "text-primary bg-primary/10 font-medium"
          : "text-foreground hover:bg-muted"
        }
      `}
      href={path}
      onClick={onCloseNav}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isScrolled = useScrollStore((state) => state.isScrolled);
  const setIsScrolled = useScrollStore((state) => state.setIsScrolled);
  const pathname = usePathname();

  // เช็คว่าอยู่ที่หน้าหลักและไม่ได้ scroll
  const isHomepageTop = mounted && pathname === "/" && !isScrolled;

  // ปิด mobile menu เมื่อ resize ไป desktop
  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768 && isOpen) {
      setIsOpen(false);
    }
  }, [isOpen]);

  // ปิด mobile menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    handleScroll();

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setIsScrolled, handleResize]);

  // ป้องกัน body scroll เมื่อ mobile menu เปิด
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleCloseNav = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <nav
        suppressHydrationWarning
        className={`
          flex items-center fixed top-0 left-0 right-0 z-50 h-15
          transition-all duration-300 ease-in-out
          ${mounted
            ? (isScrolled || isOpen
              ? 'bg-white/95 dark:bg-background/95 backdrop-blur-md shadow-sm'
              : 'bg-transparent')
            : 'bg-transparent'
          }
        `}
      >
        <div className="container mx-auto flex items-center max-w-6xl px-2">
          <LogoSwitcher />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-row md:items-center md:justify-center md:gap-x-8">
            <NavLink path="/" isHomepageTop={isHomepageTop}>หน้าหลัก</NavLink>
            <NavLink path="/contact" isHomepageTop={isHomepageTop}>ติดต่อลงข้อมูล</NavLink>
            <NavLink path="/landowner" isHomepageTop={isHomepageTop}>สำหรับเจ้าของลาน</NavLink>
          </div>

          {/* Desktop User Dialog */}
          <div className="hidden md:flex md:flex-1 md:items-center md:justify-end md:gap-4">
            <UserDialog />
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden ml-auto">
            <UserDialog />
            <Button
              className="flex h-9 w-9 items-center justify-center rounded-full cursor-pointer"
              variant={isHomepageTop && !isOpen ? "default" : "outline"}
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
            >
              <span className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                {!isOpen ? <AlignJustify className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/50 md:hidden
          transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleCloseNav}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={`
          fixed top-15 left-0 right-0 z-40 md:hidden
          bg-white dark:bg-background
          border-b border-border
          shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
          }
        `}
      >
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-col gap-1">
            <NavLinkMobile onCloseNav={handleCloseNav} path="/">
              หน้าหลัก
            </NavLinkMobile>
            <NavLinkMobile onCloseNav={handleCloseNav} path="/contact">
              ติดต่อลงข้อมูล
            </NavLinkMobile>
            <NavLinkMobile onCloseNav={handleCloseNav} path="/landowner">
              สำหรับเจ้าของลาน
            </NavLinkMobile>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
