'use client'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"




// สร้าง schema สำหรับ validation
const formSchema = z.object({
  campName: z.string().min(3, {
    message: "ชื่อแคมป์ต้องมีอย่างน้อย 3 ตัวอักษร",
  }),
  phoneNumber: z.string().min(9, {
    message: "เบอร์ติดต่อต้องมีอย่างน้อย 9 หลัก",
  }).regex(/^[0-9-+\s]+$/, {
    message: "เบอร์ติดต่อต้องเป็นตัวเลขเท่านั้น",
  }),
  lineId: z.string().optional(),
})

export default function ContactForm() {
  // สร้าง loading state
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()

  // สร้าง form instance
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campName: "",
      phoneNumber: "",
      lineId: "",
    },
  })

  // ฟังก์ชันสำหรับการ submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      // เตรียมข้อมูลส่ง รวมข้อมูลผู้ใช้จาก session
      const submitData = {
        ...values,
        userInfo: session?.user ? {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          provider: (session.user as typeof session.user & { provider?: string }).provider,
          providerId: (session.user as typeof session.user & { providerId?: string }).providerId,
        } : null
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        // แสดง toast message เมื่อส่งข้อมูลสำเร็จ
        toast.success("ส่งข้อมูลเรียบร้อยแล้ว", {
          description: "แคมป์หมูแคมป์หมี จะติดต่อกลับโดยเร็วที่สุด",
        })
        // รีเซ็ตฟอร์มหลังจากส่งข้อมูลสำเร็จ
        form.reset()
      } else {
        // แสดง error toast
        toast.error("เกิดข้อผิดพลาด", {
          description: data.error || "กรุณาลองใหม่อีกครั้ง",
        })
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto pt-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="campName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ชื่อแคมป์ของคุณ</FormLabel>
                <FormControl>
                  <Input placeholder="กรุณาใส่ชื่อแคมป์" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>เบอร์ติดต่อ</FormLabel>
                <FormControl>
                  <Input placeholder="กรุณาใส่เบอร์ติดต่อ" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="กรุณาใส่ Line ID (ไม่บังคับ)"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="default"
            className="cursor-pointer"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "ส่งข้อมูล"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
