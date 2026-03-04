import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher";
import { readClient as client } from "@/sanity/client";
import { TAG_LABELS } from "@/lib/tags";

const CAMP_COUNT_QUERY = `count(*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)])`;
const TAGS_QUERY = `array::unique(*[_type == "post" && !(_id in path("drafts.**")) && defined(slug.current)].tags[])`;

const Footer = async () => {
  const [campCount, tags] = await Promise.all([
    client.fetch<number>(CAMP_COUNT_QUERY, {}, { next: { revalidate: 3600 } }),
    client.fetch<string[]>(TAGS_QUERY, {}, { next: { revalidate: 3600 } }),
  ]);
  return (
    <footer className="bg-gray-100 dark:bg-[#0a0a0a]">
      <div className="container mx-auto max-w-[1800px] px-2 lg:px-6">
        <div className="py-6 lg:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
            {/* Logo and Description */}
            <div className="flex flex-col ">
              <div className="flex flex-col items-start gap-4">
                <ThemeSwitcher />
                <div className="flex flex-col ">
                  <p className="text-md max-lg:text-sm">
                    แคมป์หมูแคมป์หมี หาลานกางเต็นท์ตรงใจคุณ
                  </p>
                  <p className="text-md max-lg:text-sm">
                    ลานกางเต็นท์ทั้งหมด:{" "}
                    <b className="text-primary">{campCount}</b> ลาน
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-lg font-bold">เมนู</h4>
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/"
                  className="text-md max-lg:text-sm hover:opacity-70"
                >
                  หน้าหลัก
                </Link>
                <Link
                  href="/contact"
                  className="text-md max-lg:text-sm hover:opacity-70"
                >
                  ติดต่อลงข้อมูล
                </Link>
                <Link
                  href="/landowner"
                  className="text-md max-lg:text-sm hover:opacity-70"
                >
                  สำหรับเจ้าของลาน
                </Link>
              </nav>
            </div>

            {/* Quick Tags */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-lg font-bold">คำค้นหา</h4>
              <nav className="flex flex-col space-y-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?tag=${tag}`}
                    className="text-md max-lg:text-sm hover:opacity-70"
                  >
                    {/* แสดงป้ายคำค้นหา */}
                    {TAG_LABELS[tag] ?? tag}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-lg font-bold">ติดต่อเรา</h4>

              {/* Social Media */}
              <div className="flex space-x-2">
                <Link
                  href="https://www.facebook.com/profile.php?id=100080127966873"
                  target="_blank"
                >
                  <Image
                    src="/assets/images/facebook.png"
                    alt="Facebook"
                    width={35}
                    height={35}
                  />
                </Link>
                <Link
                  href="https://www.instagram.com/campmoocampmee/"
                  target="_blank"
                >
                  <Image
                    src="/assets/images/instagram.png"
                    alt="Instagram"
                    width={35}
                    height={35}
                  />
                </Link>
                <Link
                  href="https://www.tiktok.com/@campmoocampmee"
                  target="_blank"
                >
                  <Image
                    src="/assets/images/tiktok.png"
                    alt="TikTok"
                    width={35}
                    height={35}
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className=" pt-6">
            <div className="flex flex-row justify-between items-center text-sm ">
              <p>&copy; 2026 campmoocampmee</p>
              <Link href="/cookie-policy" className="underline-none">
                นโยบายการใช้คุกกี้
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
