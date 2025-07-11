import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import Header from "@/components/header/Header";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({

  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "แคมป์ไหนดี",
  description: "แหล่งรวมข้อมูลแคมป์และที่พักในประเทศไทย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          ' bg-background  antialiased',
          notoSansThai.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
