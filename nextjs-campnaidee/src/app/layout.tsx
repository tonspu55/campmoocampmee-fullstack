import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ConditionalLayout from "@/components/ConditionalLayout";

const notoSansThai = Noto_Sans_Thai({

  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "แคมป์ไหนดี",
  description: "ค้นหาลานกางเต็นท์หรือแคมป์ปิ้ง สำหรับการพักผ่อนที่ดีที่สุด",
  openGraph: {
    title: "แคมป์ไหนดี",
    description: "ค้นหาลานกางเต็นท์หรือแคมป์ปิ้ง สำหรับการพักผ่อนที่ดีที่สุด",
    images: [
      {
        url: "/assets/images/banner-desktop.jpg",
        width: 1200,
        height: 630,
        alt: "ค้นหาลานกางเต็นท์หรือแคมป์ปิ้ง สำหรับการพักผ่อนที่ดีที่สุด",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "แคมป์ไหนดี",
    description: "ค้นหาลานกางเต็นท์หรือแคมป์ปิ้ง สำหรับการพักผ่อนที่ดีที่สุด",
    images: ["/assets/images/banner-desktop.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="google-site-verification" content="1ux37MJZu2__Qw7RM8WVtQNTV9lVcUI3xklRWoXaFdo" />
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
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-36B3HR5S05"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-36B3HR5S05');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
          <Toaster />
        </ThemeProvider>

      </body>
    </html>
  );
}
