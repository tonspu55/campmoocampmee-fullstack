import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ConditionalLayout from "@/components/ConditionalLayout";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";
import WishlistInitializer from "@/components/WishlistInitializer";

const SITE_URL = "https://www.campmoocampmee.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "แคมป์หมูแคมป์หมี",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/images/favicon/android-chrome-512x512.png`,
  description:
    "หาลานกางเต็นท์ทั่วไทย ค้นหาที่พักแคมป์ปิ้ง ลานกางเต็นท์ภาคเหนือ ภาคกลาง ภาคอีสาน ภาคตะวันออก รีวิวและราคาครบ",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "แคมป์หมูแคมป์หมี",
  url: SITE_URL,
  description:
    "หาลานกางเต็นท์ทั่วไทย ค้นหาที่พักแคมป์ปิ้ง ลานกางเต็นท์ภาคเหนือ ภาคกลาง ภาคอีสาน ภาคตะวันออก รีวิวและราคาครบ",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/search?province={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const notoSansThai = Noto_Sans_Thai({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.campmoocampmee.com"),
  title: "หาลานกางเต็นท์ ที่พักแคมป์ปิ้งทั่วไทย - แคมป์หมูแคมป์หมี",
  description:
    "หาลานกางเต็นท์ทั่วไทย ค้นหาที่พักแคมป์ปิ้ง ลานกางเต็นท์ภาคเหนือ ภาคกลาง ภาคอีสาน ภาคตะวันออก รีวิวและราคาครบ",
  openGraph: {
    title: "หาลานกางเต็นท์ ที่พักแคมป์ปิ้งทั่วไทย - แคมป์หมูแคมป์หมี",
    description:
      "หาลานกางเต็นท์ทั่วไทย ค้นหาที่พักแคมป์ปิ้ง ลานกางเต็นท์ภาคเหนือ ภาคกลาง ภาคอีสาน ภาคตะวันออก รีวิวและราคาครบ",
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
    <html lang="th" suppressHydrationWarning>
      <meta
        name="google-site-verification"
        content="1ux37MJZu2__Qw7RM8WVtQNTV9lVcUI3xklRWoXaFdo"
      />
      <link rel="icon" href="/assets/images/favicon/favicon.ico" sizes="any" />
      <link
        rel="apple-touch-icon"
        href="/assets/images/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/assets/images/favicon/android-chrome-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="512x512"
        href="/assets/images/favicon/android-chrome-512x512.png"
      />
      <body
        className={cn(" bg-background  antialiased", notoSansThai.className)}
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
        <JsonLd data={organizationSchema} />
        <JsonLd data={websiteSchema} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <AuthProvider>
            <WishlistInitializer />
            <ConditionalLayout footer={<Footer />}>{children}</ConditionalLayout>
          </AuthProvider>
          <Toaster />
          <CookieConsent />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
