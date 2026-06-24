import { handleRoute } from "@/server/http";
import { requireSession } from "@/server/session";
import { getUserIdentity } from "@/server/identity.service";
import { listLandownerPosts } from "@/server/posts.service";

// Disable static generation for this route
export const dynamic = "force-dynamic";

// ดึงข้อมูล post ทั้งหมดของเจ้าของลาน
export const GET = handleRoute(async () => {
  const session = await requireSession();
  const { providerId } = await getUserIdentity(session.user.id);
  const posts = await listLandownerPosts(providerId);

  return {
    body: { posts, providerId },
    headers: { "Cache-Control": "no-store, max-age=0" },
  };
}, "เกิดข้อผิดพลาดในการดึงข้อมูล");
