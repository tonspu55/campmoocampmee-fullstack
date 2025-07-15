"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, ReactNode } from "react";
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher";
import { LogoSwitcher } from "@/components/header/LogoSwitcher";
import { AlignJustify, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const isExternal = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('www.');

  if (isExternal) {
    return (
      <a
        className="hover:text-[#085953] font-medium"
        href={path.startsWith('www.') ? `https://${path}` : path}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={`${pathname === path ? "text-[#085953]" : ""
        } hover:text-[#085953] font-medium`}
      href={path}
    >
      {children}
    </Link>
  );
};

const NavLinkMobile = ({ path, children, onCloseNav }: NavLinkMobileProps) => {
  const pathname = usePathname();
  const isExternal = path.startsWith('http://') || path.startsWith('https://') || path.startsWith('www.');

  if (isExternal) {
    return (
      <a
        className="hover:text-[#085953] font-medium"
        href={path.startsWith('www.') ? `https://${path}` : path}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onCloseNav}
      >
        {children}
      </a>
    );
  }

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



  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const menuClasses = useMemo(() => {
    if (isOpen) {
      return [
        "flex",
        "absolute",
        "top-[70px]",
        "w-full",
        "p-2",
        "gap-2",
        "flex-col",
        "left-0",
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
      className={`flex items-center fixed top-0 left-0 right-0 z-50 h-[70px] bg-white dark:bg-[var(--background)]`}

    >
      <div className="container mx-auto flex items-center max-w-6xl max-md:px-2">
        <LogoSwitcher />
        <div className={`${menuClasses} bg-white dark:bg-[var(--background)]`} >
          {isMobileView ? (
            <>
              <div className="flex flex-row justify-between">
                <div className=" flex flex-col gap-2">
                  <NavLinkMobile
                    onCloseNav={() => setIsOpen(false)}
                    path="/"
                  >
                    หน้าหลัก
                  </NavLinkMobile>
                  <NavLinkMobile
                    onCloseNav={() => setIsOpen(false)}
                    path="https://www.facebook.com/profile.php?id=100080127966873"
                  >
                    ติดต่อลงข้อมูลแคมป์
                  </NavLinkMobile>
                </div>
                <div className="flex flex-col items-end">
                  <ThemeSwitcher />
                </div>
              </div>
            </>
          ) : (
            <>
              <NavLink path="/">หน้าหลัก</NavLink>
              <NavLink path="https://www.facebook.com/profile.php?id=100080127966873">ติดต่อลงข้อมูลแคมป์</NavLink>
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
