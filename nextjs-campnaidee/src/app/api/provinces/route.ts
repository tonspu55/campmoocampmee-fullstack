import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

const PROVINCES_QUERY = `*[
  _type == "land"
  && !(_id in path("drafts.**"))
  && defined(slug.current)
  && defined(address.province)
]{
  "province": address.province
}`;

export async function GET() {
  try {
    const options = { next: { revalidate: 3600 } }; // Cache for 1 hour

    // ดึงข้อมูลจังหวัดทั้งหมดจาก posts
    const results = await client.fetch(PROVINCES_QUERY, {}, options);

    // นับจำนวนแคมป์ในแต่ละจังหวัด
    const provinceCount: { [key: string]: number } = {};

    results
      .map((item: { province: string }) => item.province)
      .filter((province: string) => province && province.trim() !== "")
      .forEach((province: string) => {
        const cleanProvince = province.trim();
        provinceCount[cleanProvince] = (provinceCount[cleanProvince] || 0) + 1;
      });

    // สร้างรายการจังหวัดพร้อมจำนวนแคมป์ และเรียงตามตัวอักษร
    const provincesWithCount = Object.entries(provinceCount)
      .map(([province, count]) => ({
        name: province,
        count: count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      provinces: provincesWithCount,
      totalProvinces: provincesWithCount.length,
    });
  } catch (error) {
    console.error("Error fetching provinces:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลจังหวัด" },
      { status: 500 }
    );
  }
}
