'use client';

import ContactForm from "@/components/ContactForm";

const ContactPage = () => {
  return (
    <main className="py-8 lg:py-12 mt-[70px]">
      <div className="container mx-auto max-w-[900px]  px-2">
        <h1 className="text-2xl font-bold text-center">ติดต่อขอลงข้อมูลแคมป์ปิ้ง</h1>
        <ContactForm />
      </div>
    </main>
  )
}

export default ContactPage;
