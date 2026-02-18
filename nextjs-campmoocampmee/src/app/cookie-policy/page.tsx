import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "นโยบายการใช้คุกกี้ - แคมป์หมูแคมป์หมี",
  description: "นโยบายการใช้คุกกี้ของเว็บไซต์แคมป์หมูแคมป์หมี เพื่อความโปร่งใสและการคุ้มครองข้อมูลส่วนบุคคลของผู้ใช้งาน",
};

const CookiePolicyPage = () => {
  return (
    <main className="py-8 lg:py-10 mt-10 lg:mt-12 container mx-auto max-w-4xl px-4">
      <article className="prose prose-slate dark:prose-invert max-w-none">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
            นโยบายการใช้คุกกี้ (Cookie Policy)
          </h1>
          <p className="text-muted-foreground">
            เว็บไซต์ แคมป์หมูแคมป์หมี (
            <Link
              href="https://www.campmoocampmee.com/"
              className="text-primary hover:underline"
            >
              https://www.campmoocampmee.com/
            </Link>
            )
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            ประกาศเมื่อ: 27 มกราคม 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-8">
          <p className="text-foreground leading-relaxed">
            เว็บไซต์ แคมป์หมูแคมป์หมี (ต่อไปนี้จะเรียกว่า "เรา")
            ตระหนักถึงความสำคัญของข้อมูลส่วนบุคคลและความเป็นส่วนตัวของผู้ใช้งาน
            (ต่อไปนี้จะเรียกว่า "ท่าน") นโยบายนี้จะอธิบายถึงความหมาย การทำงาน
            วัตถุประสงค์ รวมถึงการลบและการปฏิเสธการเก็บคุกกี้
            เพื่อความเป็นส่วนตัวของท่าน โดยมีรายละเอียดดังนี้
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            1. คุกกี้ (Cookies) คืออะไร
          </h2>
          <p className="text-foreground leading-relaxed">
            คุกกี้ คือ ไฟล์ข้อความขนาดเล็กที่ถูกจัดเก็บไว้ในคอมพิวเตอร์
            หรืออุปกรณ์ที่เชื่อมต่ออินเทอร์เน็ต เช่น สมาร์ทโฟน หรือแท็บเล็ต ของท่าน
            เมื่อท่านเข้าเยี่ยมชมเว็บไซต์
            คุกกี้จะทำหน้าที่บันทึกข้อมูลและการตั้งค่าต่างๆ เช่น
            สถานะการเข้าใช้งาน ภาษาที่เลือกใช้ หรือประวัติการเข้าชม
            เพื่อช่วยให้ท่านสามารถใช้งานเว็บไซต์ได้อย่างต่อเนื่องและมีประสิทธิภาพ
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            2. เราใช้คุกกี้อย่างไร
          </h2>
          <p className="text-foreground leading-relaxed mb-3">
            เราใช้คุกกี้เพื่อวัตถุประสงค์ดังต่อไปนี้:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>เพื่อช่วยให้เว็บไซต์ทำงานได้อย่างถูกต้องและปลอดภัย</li>
            <li>
              เพื่อจดจำการตั้งค่าและการใช้งานของท่าน (เช่น การค้นหาลานกางเต็นท์ล่าสุด)
            </li>
            <li>
              เพื่อวิเคราะห์ข้อมูลการใช้งานเว็บไซต์
              นำไปปรับปรุงและพัฒนาประสบการณ์การใช้งานให้ดียิ่งขึ้น
            </li>
            <li>
              เพื่อเชื่อมโยงข้อมูลกับการใช้งานโซเชียลมีเดีย (เช่น Facebook)
              ในกรณีที่มีการประชาสัมพันธ์
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            3. ประเภทของคุกกี้ที่เราใช้
          </h2>
          <p className="text-foreground leading-relaxed mb-4">
            เว็บไซต์ของเราอาจมีการใช้งานคุกกี้ดังต่อไปนี้:
          </p>

          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                คุกกี้ที่จำเป็นอย่างยิ่ง (Strictly Necessary Cookies)
              </h3>
              <p className="text-foreground leading-relaxed">
                คุกกี้ประเภทนี้มีความสำคัญต่อการทำงานของเว็บไซต์
                ซึ่งรวมถึงคุกกี้ที่ช่วยให้ท่านสามารถเข้าถึงข้อมูลและใช้งานเว็บไซต์ได้อย่างปลอดภัย
                การปิดการใช้งานคุกกี้ประเภทนี้อาจทำให้ท่านไม่สามารถใช้งานบางส่วนของเว็บไซต์ได้
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                คุกกี้เพื่อการวิเคราะห์/วัดผลการทำงาน (Performance Cookies)
              </h3>
              <p className="text-foreground leading-relaxed">
                คุกกี้ประเภทนี้ช่วยให้เราทราบถึงจำนวนผู้เข้าชมและพฤติกรรมการเยี่ยมชมเว็บไซต์
                เพื่อนำข้อมูลมาวิเคราะห์และปรับปรุงประสิทธิภาพการทำงานของเว็บไซต์ให้ดียิ่งขึ้น
                ข้อมูลที่ได้จากคุกกี้นี้จะไม่สามารถระบุตัวตนของท่านได้โดยตรง
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                คุกกี้เพื่อการทำงานของเว็บไซต์ (Functionality Cookies)
              </h3>
              <p className="text-foreground leading-relaxed">
                คุกกี้ประเภทนี้ช่วยจดจำการตั้งค่าของท่าน เช่น ภาษาที่เลือก
                หรือข้อมูลการค้นหา
                เพื่ออำนวยความสะดวกเมื่อท่านกลับมาใช้งานเว็บไซต์อีกครั้ง
              </p>
            </div>

            <div className="border-l-4 border-primary pl-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                คุกกี้เพื่อการตลาด (Targeting Cookies)
              </h3>
              <p className="text-foreground leading-relaxed">
                (หากเว็บไซต์มีการยิงโฆษณาหรือเก็บ Pixel)
                คุกกี้ประเภทนี้อาจถูกติดตั้งโดยพันธมิตรทางการตลาด
                หรือโซเชียลมีเดียของเรา
                เพื่อสร้างโปรไฟล์เกี่ยวกับความสนใจของท่านและแสดงโฆษณาที่เกี่ยวข้องกับท่านในเว็บไซต์อื่นๆ
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            4. คุกกี้ของบุคคลที่สาม (Third-Party Cookies)
          </h2>
          <p className="text-foreground leading-relaxed">
            ในบางครั้ง เราอาจมีการใช้คุกกี้จากผู้ให้บริการภายนอก เช่น Google Analytics
            เพื่อวิเคราะห์สถิติ หรือ Facebook เพื่อการเชื่อมต่อโซเชียลมีเดีย
            ข้อมูลการใช้งานของท่านอาจถูกส่งไปยังผู้ให้บริการเหล่านั้นตามนโยบายความเป็นส่วนตัวของผู้ให้บริการแต่ละราย
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            5. การจัดการและการปิดกั้นคุกกี้
          </h2>
          <p className="text-foreground leading-relaxed mb-4">
            ท่านสามารถเลือกที่จะยอมรับหรือปฏิเสธคุกกี้ได้
            โดยการตั้งค่าในเบราว์เซอร์ของท่าน อย่างไรก็ตาม โปรดทราบว่าการปิดการใช้งานคุกกี้บางประเภทอาจส่งผลกระทบต่อประสิทธิภาพในการใช้งานเว็บไซต์ของเรา
          </p>
          <p className="text-foreground leading-relaxed mb-3">
            ท่านสามารถเรียนรู้วิธีการจัดการคุกกี้ในเบราว์เซอร์ยอดนิยมได้จากลิงก์ด้านล่างนี้:
          </p>
          <ul className="list-disc list-inside space-y-2 text-foreground ml-4">
            <li>
              <Link
                href="https://support.google.com/chrome/answer/95647"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Google Chrome
              </Link>
            </li>
            <li>
              <Link
                href="https://support.apple.com/th-th/105082"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Safari (iOS)
              </Link>
            </li>
            <li>
              <Link
                href="https://support.apple.com/th-th/guide/safari/sfri11471/mac"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Safari (macOS)
              </Link>
            </li>
            <li>
              <Link
                href="https://support.microsoft.com/th-th/microsoft-edge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Microsoft Edge
              </Link>
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            6. การเปลี่ยนแปลงนโยบายการใช้คุกกี้
          </h2>
          <p className="text-foreground leading-relaxed">
            เราอาจทำการปรับปรุงนโยบายการใช้คุกกี้นี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการเปลี่ยนแปลงของการให้บริการหรือกฎหมายที่เกี่ยวข้อง
            เราแนะนำให้ท่านเข้ามาตรวจสอบหน้านี้อย่างสม่ำเสมอ
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            7. ช่องทางการติดต่อ
          </h2>
          <p className="text-foreground leading-relaxed mb-4">
            หากท่านมีข้อสงสัยเกี่ยวกับนโยบายการใช้คุกกี้
            หรือการจัดการข้อมูลส่วนบุคคล สามารถติดต่อเราได้ที่:
          </p>
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-foreground">
              <strong>เว็บไซต์:</strong>{" "}
              <Link
                href="https://www.campmoocampmee.com/"
                className="text-primary hover:underline"
              >
                https://www.campmoocampmee.com/
              </Link>
            </p>
            <p className="text-foreground">
              <strong>Facebook Page:</strong>{" "}
              <Link
                href="https://www.facebook.com/profile.php?id=100080127966873"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                แคมป์หมูแคมป์หมี
              </Link>
            </p>
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            เอกสารนี้ได้รับการจัดทำขึ้นเพื่อความโปร่งใสและการคุ้มครองสิทธิ์ความเป็นส่วนตัวของผู้ใช้งาน
            <br />
            หากมีข้อสงสัยหรือต้องการข้อมูลเพิ่มเติม กรุณาติดต่อเราตามช่องทางที่ระบุไว้ข้างต้น
          </p>
        </div>
      </article>
    </main>
  );
};

export default CookiePolicyPage;