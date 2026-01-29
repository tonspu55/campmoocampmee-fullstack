import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import styles from "@/app/homepage.module.css";

export const metadata: Metadata = {
  title: "ติดต่อลงข้อมูล | แคมป์หมูแคมป์หมี",
  description: "ส่งรายละเอียดข้อมูลเบื้องต้นเพื่อให้ทางเราติดต่อกลับโดยเร็วที่สุด",
};

const ContactPage = () => {
  return (
    <main className="py-8 lg:py-10 mt-8 lg:mt-10">
      <div className="container mx-auto max-w-225 ">
        <h1 className="text-lg lg:text-2xl font-semibold text-center">ติดต่อลงข้อมูล</h1>
        <div className={`${styles.contactBg} lg:rounded-[20px] mt-4 lg:mt-6 flex flex-col h-55!  lg:h-75!`}>
          <div className="flex flex-col items-start justify-center h-full">
            <div className="w-[80%] lg:w-[45%]">
              <div className="flex flex-col items-start  max-lg:pl-4 lg:pl-10">
                <h4 className="text-white  text-[16px] lg:text-[18px] font-bold">เปลี่ยนลานกางเต็นท์ของคุณ<br />ให้เป็นจุดหมายใหม่ของนักเดินทาง</h4>
                <p className="text-white  font-medium text-[14px] lg:text-[14px] mt-2">สำหรับเจ้าของธุรกิจที่สนใจลงข้อมูลเกี่ยวกับที่พักของท่านผ่านเว็บแคมป์หมูแคมป์หมี เพื่อนำหน้าเพจไปใช้โปรโมทผ่านช่องทางต่างๆฟรีโดยไม่มีค่าใช้จ่ายใดๆทั้งสิ้นในการลงข้อมูล</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-center mt-4 lg:mt-6">ส่งรายละเอียดข้อมูลเบื้องต้น<br className="md:hidden" />เพื่อให้ทางเราติดต่อกลับโดยเร็วที่สุด</p>
        <ContactForm />
      </div>
    </main>
  )
}

export default ContactPage;
