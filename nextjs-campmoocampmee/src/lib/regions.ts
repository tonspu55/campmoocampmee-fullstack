// รายชื่อภาคของไทย
export const REGIONS: { th: string; en: string; slug: string }[] = [
  { th: "ภาคเหนือ", en: "Northern", slug: "northern" },
  { th: "ภาคตะวันออกเฉียงเหนือ", en: "Northeastern", slug: "northeastern" },
  { th: "ภาคกลาง", en: "Central", slug: "central" },
  { th: "ภาคตะวันออก", en: "Eastern", slug: "eastern" },
  { th: "ภาคตะวันตก", en: "Western", slug: "western" },
  { th: "ภาคใต้", en: "Southern", slug: "southern" },
];

// แปลง slug เป็นชื่อภาคภาษาไทย
export function getThaiRegionName(slug: string): string | undefined {
  const region = REGIONS.find((r) => r.slug === slug.toLowerCase());
  return region?.th;
}

// แปลงชื่อภาคภาษาไทยเป็น slug
export function getRegionSlug(thaiName: string): string | undefined {
  const region = REGIONS.find(
    (r) => r.th === thaiName.trim() || r.th.includes(thaiName.trim()),
  );
  return region?.slug;
}
