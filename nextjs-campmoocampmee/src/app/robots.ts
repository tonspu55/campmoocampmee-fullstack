import type { MetadataRoute } from "next";

const SITE_URL = "https://www.campmoocampmee.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/landowner/", // หน้าจัดการของเจ้าของที่ดิน
        "/auth/", // หน้า sign-in ทั้งหมด
        "/wishlists", // รายการโปรดเฉพาะผู้ใช้
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
