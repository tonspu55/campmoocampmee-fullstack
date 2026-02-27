import { createClient } from "next-sanity";

const config = {
  projectId: "tqzf3jx1",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
};

// สำหรับ read-only → ใช้ CDN cache ลด API request
export const readClient = createClient({
  ...config,
  useCdn: true,
});

// สำหรับ write (mutations) → ต้องการ token + ไม่ผ่าน CDN
export const client = createClient({
  ...config,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
