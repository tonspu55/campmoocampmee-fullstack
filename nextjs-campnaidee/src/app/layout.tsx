import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from '@/components/ui/theme-provider';
import { cn } from '@/lib/utils';
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ConditionalLayout from "@/components/ConditionalLayout";
import AuthProvider from "@/components/AuthProvider";

const notoSansThai = Noto_Sans_Thai({

  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "แคมป์หมูแคมป์หมี | จองที่พักแคมป์ปิ้ง | ลานกางเต็นท์ทั่วไทย",
  description: "ค้นหาและจองลานกางเต็นท์ ผ่านข้อมูลจากเจ้าของที่พักที่ถูกต้อง แผนที่-เส้นทาง อัพเดต 2025 ",
  openGraph: {
    title: "แคมป์หมูแคมป์หมี | จองที่พักแคมป์ปิ้ง | ลานกางเต็นท์ทั่วไทย",
    description: "ค้นหาและจองลานกางเต็นท์ ผ่านข้อมูลจากเจ้าของที่พักที่ถูกต้อง แผนที่-เส้นทาง อัพเดต 2025 ",
    images: [
      {
        url: "/assets/images/banner-desktop.jpg",
        width: 1200,
        height: 630,
        alt: "แคมป์หมูแคมป์หมี",
      },
    ],
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
          src="https://www.googletagmanager.com/gtag/js?id=G-DR8BCC2VX9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DR8BCC2VX9');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>

      </body>
    </html>
  );
}
