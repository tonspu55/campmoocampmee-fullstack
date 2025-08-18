'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'
import ContactForm from '@/components/ContactForm'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

export default function ProtectedContactForm() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/',
      redirect: true,
    })
  }

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">กำลังตรวจสอบการเข้าสู่ระบบ...</span>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">กำลังเปลี่ยนเส้นทางไปหน้าเข้าสู่ระบบ...</p>
      </div>
    )
  }

  return (
    <div className='max-w-md mx-auto'>
      <div className="mt-6 mb-2  p-4 bg-[#F39C12]  rounded-lg">
        <div className="flex flex-row  justify-between items-center">
          <div className="flex flex-row gap-2">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div className='flex flex-col'>

              <p className="text-primary text-normal">
                {session.user?.name}
              </p>
              <p className="text-primary text-sm">{session.user?.email}</p>


            </div>
          </div>
          <Button
            onClick={handleSignOut}
            variant="default"
            size="sm"
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">ออกจากระบบ</span>
          </Button>
        </div>
      </div>
      <ContactForm />
    </div>
  )
}
