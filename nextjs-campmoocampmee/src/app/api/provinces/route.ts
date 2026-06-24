import { handleRoute } from "@/server/http";
import { getProvincesWithCount } from "@/server/provinces.service";

export const GET = handleRoute(async () => {
  return { body: await getProvincesWithCount() };
}, "เกิดข้อผิดพลาดในการดึงข้อมูลจังหวัด");
