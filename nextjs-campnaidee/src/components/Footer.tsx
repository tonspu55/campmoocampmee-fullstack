import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  return (
    <footer className="bg-[#085953] text-white py-8 ">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">

              <h3 className="text-xl font-bold">แคมป์ไหนดี</h3>
            </div>
            <p className="text-gray-300 text-sm">
              ค้นหาที่พักแคมป์ปิ้งและธรรมชาติ
              สำหรับการพักผ่อนที่ดีที่สุด
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-lg font-semibold">Sitemap</h4>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                หน้าหลัก
              </Link>

              <Link href="https://www.facebook.com/profile.php?id=100080127966873" target='_blank' className="text-gray-300 hover:text-white transition-colors">
                ติดต่อลงข้อมูลแคมป์
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-lg font-semibold">ติดต่อเรา</h4>
            <div className="flex flex-col space-y-2 text-gray-300">
              <p className="text-sm">
                <span className="font-medium">อีเมล:</span> tonspu90@gmail.com
              </p>
              <p className="text-sm">
                <span className="font-medium">โทรศัพท์:</span> 0635979594
              </p>
              {/* <p className="text-sm">
                <span className="font-medium">ที่อยู่:</span> กรุงเทพมหานคร, ประเทศไทย
              </p> */}
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mt-4">
              <Link href="https://www.facebook.com/profile.php?id=100080127966873" target='_blank' className="text-gray-300 hover:text-white transition-colors">
                <Image
                  src="/assets/images/facebook.png"
                  alt="Facebook"
                  width={35}
                  height={35}
                />
              </Link>
              {/* <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                <Image
                  src="/assets/images/instagram.png"
                  alt="Instagram"
                  width={35}
                  height={35}
                />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white transition-colors">
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
        <div className="border-t border-gray-600 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-300">
            <p>&copy; 2025 campnaidee.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;