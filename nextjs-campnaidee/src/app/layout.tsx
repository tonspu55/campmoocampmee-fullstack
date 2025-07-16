import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import Header from "@/components/header/Header";
import "./globals.css";
import Footer from "@/components/Footer";

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
      <link rel="icon" href="/assets/images/favicon/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/assets/images/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/favicon/android-chrome-192x192.png" />
      <link rel="icon" type="image/png" sizes="512x512" href="/assets/images/favicon/android-chrome-512x512.png" />
      <body
        className={cn(
          ' bg-background  antialiased',
          notoSansThai.className
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
