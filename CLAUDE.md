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
| Auth           | NextAuth.js 4 (Google OAuth)                        |
| CMS / Database | Sanity.io v5 (Content Lake)                         |
| Maps           | @react-google-maps/api                              |
| Animation      | GSAP, Swiper, Embla Carousel                        |
| Analytics      | Vercel Analytics                                    |
| Deployment     | Vercel (frontend), Sanity Cloud (CMS)               |
| Package Mgr    | pnpm                                                |

## Commands

```bash
# Frontend (nextjs-campmoocampmee/)
pnpm dev        # Dev server (localhost:2499)
pnpm build      # Production build
pnpm start      # Production server
pnpm lint       # ESLint

# CMS (studio-campmoocampmee/)
pnpm dev        # Sanity Studio dev
pnpm deploy     # Deploy studio
```

## Environment

- Dev: Sanity dataset `develop`, base URL `http://localhost:2499`
- Prod: Sanity dataset `production`, base URL `https://www.campmoocampmee.com`
- ต้องมี: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `GOOGLE_MAPS_API_KEY`

## Key Patterns

- **ISR**: หน้า camp detail revalidate ทุก 300 วินาที
- **force-dynamic**: หน้า search ใช้ dynamic rendering
- **Sanity client**: config อยู่ที่ `src/sanity/client.ts`
- **Zustand stores**: `src/lib/store.ts` (scroll, gallery, landowner state)
- **UI components**: shadcn/ui อยู่ใน `src/components/ui/`
- **Auth flow**: user ปกติ → `/auth/signin`, เจ้าของที่ → `/auth/signin-landowner`

## Conventions

- ใช้ TypeScript strict mode
- ใช้ `cn()` utility สำหรับ merge Tailwind classes
- ภาษาไทยสำหรับ UI content, ภาษาอังกฤษสำหรับ code
- ไม่มี testing framework ติดตั้ง (ยังไม่ได้ setup Jest/Vitest)
