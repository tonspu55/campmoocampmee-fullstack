

import ProtectedContactForm from "@/components/ProtectedContactForm";

const ContactPage = () => {
  return (
    <main className="py-8 lg:py-10 mt-[60px]">
      <div className="container mx-auto max-w-[900px] px-2">
        <h1 className="text-lg lg:text-2xl font-bold text-center">ติดต่อลงข้อมูล</h1>
        <ProtectedContactForm />
      </div>
    </main>
  )
}

export default ContactPage;
