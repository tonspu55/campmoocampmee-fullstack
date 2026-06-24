import { readClient } from "@/sanity/client";
import { getProvinceSlug } from "@/lib/provinces";

const PROVINCES_QUERY = `*[
  _type == "post"
  && !(_id in path("drafts.**"))
  && defined(slug.current)
  && defined(address.province)
]{
  "province": address.province
}`;

// Aggregate published camps by province, with a stable slug, sorted by name.
export async function getProvincesWithCount() {
  const results = await readClient.fetch<{ province: string }[]>(
    PROVINCES_QUERY,
    {},
    { next: { revalidate: 3600 } }, // Cache for 1 hour
  );

  const provinceCount: Record<string, number> = {};
  results
    .map((item) => item.province)
    .filter((province) => province && province.trim() !== "")
    .forEach((province) => {
      const cleanProvince = province.trim();
      provinceCount[cleanProvince] = (provinceCount[cleanProvince] || 0) + 1;
    });

  const provinces = Object.entries(provinceCount)
    .map(([province, count]) => ({
      name: province,
      slug:
        getProvinceSlug(province) || province.toLowerCase().replace(/\s+/g, "-"),
      count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { provinces, totalProvinces: provinces.length };
}
