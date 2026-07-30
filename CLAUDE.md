# CampMooCampMee Fullstack

แพลตฟอร์มรวมข้อมูลแคมป์ปิ้งทั่วไทย ผู้ใช้ค้นหา/รีวิวแคมป์ได้ เจ้าของที่ดินจัดการ listing ได้

## Project Structure

Monorepo แบ่งเป็น 2 ส่วน:

- `nextjs-campmoocampmee/` — Next.js 16 frontend (App Router, Turbopack)
- `studio-campmoocampmee/` — Sanity Studio v6 (headless CMS)

## Tech Stack

| Category       | Technology                                          |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19, TypeScript 5.9   |
| Styling        | Tailwind CSS 4, shadcn/ui (New York), Radix UI      |
| State          | Zustand 5                                           |
| Forms          | React Hook Form + Zod                               |
| Auth           | Better Auth 1.6 (Google OAuth) + Prisma adapter     |
| Auth DB        | Supabase Postgres (via Prisma 6, pgBouncer pooling) |
| CMS            | Sanity.io v6 (Content Lake)                         |
| Maps           | Leaflet + react-leaflet (OpenStreetMap tiles)       |
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
  - อื่นๆ: `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`
  - Optional: `NEXT_PUBLIC_MAP_TILE_URL` (เปลี่ยน tile provider ของแผนที่; default = CARTO Voyager บนข้อมูล OSM, ไม่ต้องใช้ API key)

## Key Patterns

- **ISR**: หน้า camp detail revalidate ทุก 300 วินาที
- **force-dynamic**: หน้า search ใช้ dynamic rendering
- **Map**: `src/components/CampMap.tsx` (Leaflet + react-leaflet, dynamic import `ssr:false` จาก `SearchMapWrapper`); marker = `L.divIcon` ป้ายราคา (สไตล์ `.camp-price-pill` ใน `globals.css`), desktop ใช้ popup / mobile ใช้การ์ดล่างจอ; ต้องคง attribution ของ OSM ไว้
- **Sanity client**: config อยู่ที่ `src/sanity/client.ts`
- **Zustand stores**: `src/lib/store.ts` — `useScrollStore`, `useGalleryStore`
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
  - phone-only signup → `getTempEmail` คืน `null` (คอลัมน์ `email` เป็น NULL, ไม่มี placeholder); `getTempName` = เบอร์โทร
- **Add phone to account** (สำหรับ user ที่ login ด้วย Google เพิ่มเบอร์ทีหลัง):
  - route `POST /api/account/phone` → `linkPhoneNumber` (`src/server/phone.service.ts`) เรียก `auth.api.verifyPhoneNumber({ updatePhoneNumber:true })` — ผูกเบอร์เข้า user ปัจจุบัน, เช็คเบอร์ซ้ำให้เอง (throw `PHONE_NUMBER_EXIST`), ไม่สร้าง user/session ใหม่
  - ส่ง OTP ฝั่ง client ด้วย `authClient.phoneNumber.sendOtp`; verify ผ่าน route แล้ว best-effort patch เบอร์เข้า Sanity mirror
  - UI: `src/components/AddPhoneDialog.tsx` (แยกจาก `PhoneOtpForm` เพื่อไม่กระทบ flow login); เปิดจากแถวเบอร์ในหน้า `/account`
  - v1: เพิ่มอย่างเดียว (ยังไม่มีแก้/ลบ); ยังไม่มีฟีเจอร์เพิ่ม email ให้ phone-only user (ต้องตั้ง email provider ก่อน)
- **Authorization/identity**: resolve จาก Postgres เสมอ (`getUserIdentity` ใน `src/server/identity.service.ts`), ไม่อ่านจาก Sanity mirror; ฟีเจอร์ที่ผูก Sanity `_id` (wishlist/review) ใช้ `resolveSanityUserId` ที่ self-heal สร้าง doc ถ้าหาย
- **Account linking policy**: `accountLinking` เปิด `trustedProviders:["google"]` (auto-link เฉพาะอีเมลตรงกัน); phone↔google ของคนเดียวกันไม่ auto-merge (คนละ identity)
- **Auth flow**: มีทางเข้าเดียวคือ `/auth/signin` (ยังไม่มี flow แยกสำหรับเจ้าของที่)
- **เจ้าของที่ (landowner)**: ยังไม่มี role/สิทธิ์ในระบบ — `User` ใน Prisma มีแต่ field auth, ไม่มี role/ownership model; ปัจจุบันเจ้าของที่ติดต่อเข้ามาผ่านฟอร์ม `/contact` (`submitContact` ใน `src/server/contact.service.ts` → เก็บเป็น doc ใน Sanity) แล้วจัดการต่อนอกระบบ; **ไม่มีที่เก็บ ownership (user ↔ camp) ที่ไหนเลย** — เดิมมี field `providerIds` ใน Sanity `post` แต่ลบทิ้งแล้ว (ไม่มีโค้ดอ่าน + production ไม่มีข้อมูล); เมื่อทำระบบเจ้าของจริง ownership ต้องอยู่ใน Postgres ไม่ใช่ Sanity เพราะ Sanity แก้ผ่าน Studio ได้ = ยกสิทธิ์ให้ตัวเองได้
- **Account page**: `/account` (`src/app/account/page.tsx`) — หน้าบัญชีของฉัน (โปรไฟล์ name/avatar แก้ผ่าน `POST /api/account/profile` + แถวเบอร์โทร/ปุ่มเพิ่มเบอร์ + ลิงก์ wishlists + ออกจากระบบ); ปุ่ม avatar ใน Header กดแล้วไป `/account` ถ้า login อยู่, ไม่งั้นเปิด login dialog (`UserDialog` = login-only)

## Conventions

- ใช้ TypeScript strict mode
- ใช้ `cn()` utility สำหรับ merge Tailwind classes
- ภาษาไทยสำหรับ UI content, ภาษาอังกฤษสำหรับ code
- ไม่มี testing framework ติดตั้ง (ยังไม่ได้ setup Jest/Vitest)
