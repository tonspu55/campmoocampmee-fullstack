import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "tqzf3jx1",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});
