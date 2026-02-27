"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header/Header";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function ConditionalLayout({ children, footer }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // ซ่อน header และ footer ในหน้า gallery
  const hideHeaderFooter = pathname.includes('/gallery');

  return (
    <div className="flex min-h-screen flex-col">
      {!hideHeaderFooter && <Header />}
      <div className="flex-1">{children}</div>
      {!hideHeaderFooter && footer}
    </div>
  );
}
