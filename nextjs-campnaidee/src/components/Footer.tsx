'use client'
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from "@/components/ui/separator"

const Footer = () => {
  return (

    <footer className='container mx-auto max-w-6xl px-2 '>
      <Separator />
      <div className="py-6 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col items-start gap-4">
              <Image
                priority
                src="/assets/images/logo.svg"
                alt="แคมป์หมูแคมป์หมี Logo"
                width={50}
                height={50}
              ></Image>
              <div className="flex flex-col gap-2">
                <h3 className="text-md">แคมป์หมูแคมป์หมี</h3>
                <p className=" text-sm">
                  ค้นหาลานกางเต็นท์หรือแคมป์ปิ้งสำหรับการพักผ่อนที่ดีที่สุด
                </p>
              </div>
            </div>

          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-lg font-bold">เมนู</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className=" hover:opacity-70">
                หน้าหลัก
              </Link>

              <Link href="/contact" className=" hover:opacity-70">
                ติดต่อลงข้อมูล
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-lg font-bold">ติดต่อเรา</h4>
            {/* <div className="flex flex-col space-y-2 ">
              <p className="text-sm">
                <span className="">เบอร์โทร</span> 0635979594
              </p>
            </div> */}

            {/* Social Media */}
            <div className="flex space-x-2">
              <Link href="https://www.facebook.com/profile.php?id=100080127966873" target='_blank' className=" hover:text-white">
                <Image
                  src="/assets/images/facebook.png"
                  alt="Facebook"
                  width={35}
                  height={35}
                />
              </Link>
              {/* <Link href="#" className=" hover:text-white">
                <Image
                  src="/assets/images/instagram.png"
                  alt="Instagram"
                  width={35}
                  height={35}
                />
              </Link>
              <Link href="#" className=" hover:text-white">
                <Image
                  src="/assets/images/line.png"
                  alt="Line"
                  width={35}
                  height={35}
                />
              </Link> */}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className=" pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm ">
            <p>&copy; 2025 campmoocampmee</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;