"use client";
import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/header/ThemeSwitcher";

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#0a0a0a]">
      <div className="container mx-auto max-w-6xl px-2 ">
        <div className="py-6 lg:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* Logo and Description */}
            <div className="flex flex-col ">
              <div className="flex flex-col items-start gap-4">
                <ThemeSwitcher />
                <div className="flex flex-col ">
                  <p>แคมป์หมูแคมป์หมี หาลานกางเต็นท์ตรงใจคุณ</p>
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

            {/* Contact Info */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-lg font-bold">ติดต่อเรา</h4>
              {/* <div className="flex flex-col space-y-2 ">
              <p className="text-sm">
                <span className="">เบอร์โทร</span> 0635979594
              </p>
            </div> */}

              {/* Social Media */}
              <div className="flex space-x-2">
                <Link
                  href="https://www.facebook.com/profile.php?id=100080127966873"
                  target="_blank"
                  className=" hover:text-white"
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
                  className=" hover:text-white"
                >
                  <Image
                    src="/assets/images/instagram.png"
                    alt="Instagram"
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
