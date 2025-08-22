import AuthenLandOwner from "@/components/AuthenLandOwner";




const ContactPage = () => {
  return (
    <main className="py-8 lg:py-10 mt-[60px]">
      <div className="container mx-auto max-w-[900px] px-2">
        <h1 className="text-lg lg:text-2xl font-bold text-center">สำหรับเจ้าของลาน</h1>
        <p className="text-center ">ระบบจัดการที่พัก</p>
        <AuthenLandOwner />
      </div>
    </main>
  )
}

export default ContactPage;
