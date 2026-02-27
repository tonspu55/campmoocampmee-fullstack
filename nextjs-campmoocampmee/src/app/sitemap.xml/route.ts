import { readClient as client } from "@/sanity/client";

interface PostSlug {
  slug: {
    current: string;
  };
  _updatedAt?: string;
}

const POSTS_QUERY = `*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)]{
  slug,
  _updatedAt
}`;

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL?.trim() || "https://www.campmoocampmee.com";

export async function GET() {
  try {
    // ดึงข้อมูล posts ทั้งหมดจาก Sanity
    const posts: PostSlug[] = await client.fetch(POSTS_QUERY);

    // สร้าง sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Contact Page -->
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Search Page -->
  <url>
    <loc>${baseUrl}/search</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Dynamic Camp Pages -->
  ${posts
    .map(
      (post: PostSlug) => `  <url>
    <loc>${baseUrl}/land/${post.slug.current}</loc>
    <lastmod>${new Date(post._updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate", // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return new Response("Error generating sitemap", { status: 500 });
  }
}
