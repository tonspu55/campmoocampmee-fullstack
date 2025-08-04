"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function LogoSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {theme === "dark" ? (
        <div className=" flex flex-1 items-center justify-start">
          <Link href="/">
            <Image
              priority
              src="/assets/images/logo.svg"
              alt="Logo"
              width={60}
              height={60}
            ></Image>
          </Link>
        </div>
      ) : (
        <div className=" flex flex-1 items-center justify-start">
          <Link href="/">
            <Image
              priority
              src="/assets/images/logo.svg"
              alt="Logo"
              width={60}
              height={60}
            ></Image>
          </Link>
        </div>
      )}
    </>
  );
}
