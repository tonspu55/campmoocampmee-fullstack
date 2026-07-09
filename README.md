# CampMooCampMee Fullstack

แพลตฟอร์มรวมข้อมูลแคมป์ปิ้งทั่วไทย ผู้ใช้ค้นหา/รีวิวแคมป์ได้ เจ้าของที่ดินจัดการ listing ได้

## Project Structure

Monorepo แบ่งเป็น 2 ส่วน:

- `nextjs-campmoocampmee/` — Next.js 16 frontend (App Router, Turbopack)
- `studio-campmoocampmee/` — Sanity Studio v5 (headless CMS)

## Tech Stack

| Category       | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript 5.8   |
| Styling        | Tailwind CSS 4, shadcn/ui (New York), Radix UI      |
| State          | Zustand 5                                           |
| Forms          | React Hook Form + Zod                               |
| Auth           | Better Auth 1.6 (Google OAuth) + Prisma adapter     |
| Auth DB        | Supabase Postgres (via Prisma 6, pgBouncer pooling) |
| CMS            | Sanity.io v5 (Content Lake)                         |
| Maps           | @react-google-maps/api                              |
| Animation      | GSAP, Swiper, Embla Carousel                        |
| Analytics      | Vercel Analytics                                    |
| Deployment     | Vercel (frontend), Sanity Cloud (CMS)               |
| Package Mgr    | pnpm                                                |

## Commands

```bash
# Frontend (nextjs-campmoocampmee/)
pnpm dev        # Dev server (localhost:2499)
pnpm build      # Production build (next build; prisma generate ผ่าน postinstall)
                # บน Vercel: scripts/prod-migrate.mjs รัน `prisma migrate deploy` เฉพาะ VERCEL_ENV=production (preview/local ข้าม)
pnpm start      # Production server
pnpm lint       # ESLint

# Auth DB (Prisma — nextjs-campmoocampmee/)
pnpm prisma generate         # gen client (รันอัตโนมัติตอน postinstall)
pnpm prisma migrate dev      # สร้าง/ใช้ migration ตอน dev (ใช้ DIRECT_URL)
pnpm prisma studio           # เปิด DB browser

# CMS (studio-campmoocampmee/)
pnpm dev        # Sanity Studio dev
pnpm deploy     # Deploy studio
```

## Environment

- Dev: Sanity dataset `develop`, base URL `http://localhost:2499`
- Prod: Sanity dataset `production`, base URL `https://www.campmoocampmee.com`
- ต้องมี:
  - Auth: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - Auth DB (Supabase): `DATABASE_URL` (pooler `:6543?pgbouncer=true`), `DIRECT_URL` (`:5432`, ใช้ตอน migrate)
  - SMS OTP (deeSMSx): `SMS_API_KEY`, `SMS_SECRET_KEY`, `SMS_SENDER` (+ optional `SMS_API_URL`; ถ้าไม่ตั้งจะ log OTP ใน dev)
  - อื่นๆ: `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`

## Key Patterns

- **ISR**: หน้า camp detail revalidate ทุก 300 วินาที
- **force-dynamic**: หน้า search ใช้ dynamic rendering
- **Sanity client**: config อยู่ที่ `src/sanity/client.ts`
- **Zustand stores**: `src/lib/store.ts` (scroll, gallery, landowner state)
- **UI components**: shadcn/ui อยู่ใน `src/components/ui/`
- **Auth (Better Auth)**:
  - Server config: `src/lib/auth.ts` (Google provider, `phoneNumber` plugin, Prisma adapter, session cookieCache 5 นาที)
  - Client: `src/lib/auth-client.ts` → ใช้ `authClient.useSession()` / `authClient.signIn.social()` / `authClient.phoneNumber.*`
  - Route handler: `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler`)
  - Server-side session: `auth.api.getSession({ headers })` ใน API routes
  - Prisma schema/models: `prisma/schema.prisma` (`User`, `Session`, `Account`, `Verification`)
  - **Sanity sync**: หลัง login จะ sync user เข้า Sanity แบบ deferred ด้วย `after()` (ไม่บล็อก redirect)
- **Phone OTP login**:
  - ใช้ Better Auth `phoneNumber` plugin (gen/ตรวจ OTP เองในตาราง `Verification`)
  - ส่ง SMS ผ่าน abstraction `src/lib/sms.ts` (`sendSms`) → deeSMSx (`POST /v1/SMSWebService`, body `{apiKey,secretKey,to,sender,msg}`, `to`=E.164 ไม่มี `+`); config ด้วย env `SMS_API_KEY`/`SMS_SECRET_KEY`/`SMS_SENDER`; ถ้าไม่ตั้งจะ log OTP ลง console (dev)
  - normalize เบอร์เป็น E.164 ไทยที่ `src/lib/phone.ts` (`toE164TH`)
  - UI: `src/components/PhoneOtpForm.tsx` (flow 3 ขั้น: เลือกวิธี → กรอกเบอร์ +66 → กรอก OTP; เก็บ resend cooldown ใน localStorage)
  - phone-only signup → gen placeholder email `<digits>@phone.campmoocampmee.com`
- **Authorization/identity**: resolve จาก Postgres เสมอ (`getUserIdentity` ใน `src/server/identity.service.ts`), ไม่อ่านจาก Sanity mirror; ฟีเจอร์ที่ผูก Sanity `_id` (wishlist/review) ใช้ `resolveSanityUserId` ที่ self-heal สร้าง doc ถ้าหาย
- **Account linking policy**: `accountLinking` เปิด `trustedProviders:["google"]` (auto-link เฉพาะอีเมลตรงกัน); phone↔google ของคนเดียวกันไม่ auto-merge (คนละ identity)
- **Auth flow**: user ปกติ → `/auth/signin`, เจ้าของที่ → `/auth/signin-landowner`
- **Account page**: `/account` (`src/app/account/page.tsx`) — หน้าบัญชีของฉัน (โปรไฟล์ + ลิงก์ wishlists/แดชบอร์ด + ออกจากระบบ); ปุ่ม avatar ใน Header กดแล้วไป `/account` ถ้า login อยู่, ไม่งั้นเปิด login dialog (`UserDialog` = login-only)

## Conventions

- ใช้ TypeScript strict mode
- ใช้ `cn()` utility สำหรับ merge Tailwind classes
- ภาษาไทยสำหรับ UI content, ภาษาอังกฤษสำหรับ code
- ไม่มี testing framework ติดตั้ง (ยังไม่ได้ setup Jest/Vitest)
