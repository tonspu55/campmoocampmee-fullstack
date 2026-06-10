'use client'

import { authClient } from '@/lib/auth-client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tent, ShieldCheck, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /FBAN|FBAV|FB_IAB|Line\/|LineBrowser|Instagram|Twitter|Snapchat/i.test(ua)
}

export default function SignInForm() {
  const [loading, setLoading] = useState(false)
  const [inAppBrowser, setInAppBrowser] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const { data: session, isPending } = authClient.useSession()

  useEffect(() => {
    setInAppBrowser(isInAppBrowser())
  }, [])

  useEffect(() => {
    if (!isPending && session) {
      router.push('/landowner')
    }
  }, [session, isPending, router])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/landowner',
      })
    } catch (error) {
      console.error('Sign in error:', error)
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="py-12 lg:py-16 mt-15">
      <div className="container mx-auto max-w-md px-4">
        <Card className="shadow-md">
          <CardHeader className="items-center text-center pb-0">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 mb-2 mx-auto">
              <Tent className="size-7 text-primary " />
            </div>
            <CardTitle className="text-2xl">
              สำหรับเจ้าของลานกางเต็นท์
            </CardTitle>
            <CardDescription className="text-base">
              กรุณาเข้าสู่ระบบเพื่อเข้าถึงข้อมูลลานกางเต็นท์ของท่าน
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            <Separator />

            {inAppBrowser ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-semibold mb-1">ไม่สามารถเข้าสู่ระบบด้วย Google ได้</p>
                  <p>เบราว์เซอร์ในแอป (Facebook / Line) ไม่รองรับการเข้าสู่ระบบด้วย Google กรุณาเปิดลิงก์นี้ในเบราว์เซอร์ Safari หรือ Chrome</p>
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground text-center">
                  <p className="font-medium text-foreground">วิธีเปิดในเบราว์เซอร์ภายนอก</p>
                  <p>กด <span className="font-semibold">ปุ่ม 3 จุด (...)</span> หรือ <span className="font-semibold">เมนู</span> แล้วเลือก <span className="font-semibold">"เปิดในเบราว์เซอร์"</span></p>
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="gap-2 w-full text-base max-w-52.5 mx-auto"
                >
                  {copied ? (
                    <Check className="size-4 text-green-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                  {copied ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="gap-3 w-full text-base max-w-52.5 mx-auto"
                >
                  {loading ? (
                    <div className="size-5 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="size-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
                </Button>

                <div className="flex items-center gap-2 text-muted-foreground text-sm justify-center">
                  <ShieldCheck className="size-4" />
                  <span>ปลอดภัยด้วยการยืนยันตัวตนจาก Google</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
