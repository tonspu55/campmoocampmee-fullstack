"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <>
      <Button
        className="flex h-9 w-9 items-center  justify-center rounded-full cursor-pointer"
        onClick={handleToggleTheme}
      >
        {theme === "dark" ? <Sun /> : <Moon />}
      </Button>
    </>
  );
}
