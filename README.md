# LUMA Mukdahan

ต้นแบบระบบจัดการจองห้องพักโรงแรมออนไลน์ในจังหวัดมุกดาหาร ตามขอบเขตโครงงานของศตายุ เสริฐศรี

## สิ่งที่มีใน MVP นี้

- หน้า landing แบบ search-first สำหรับค้นหาที่พัก
- รายการที่พักพร้อมตัวกรองราคา / คะแนน / การเรียงลำดับ และ grid/list view
- booking flow 3 ขั้นตอน พร้อมสรุปราคาและหน้าจอยืนยันการจอง
- dashboard สำหรับผู้จัดการ/พนักงาน: KPI, รายได้, อัตราเข้าพัก, รายการจอง และ quick actions โดย KPI/กราฟ/รายการจองอ่านจาก Supabase จริง
- หน้าเข้าสู่ระบบ/สมัครสมาชิกที่ต่อกับ Supabase Auth ได้เมื่อใส่ environment variables
- `supabase/schema.sql` พร้อมตาราง profiles, room_types, rooms, bookings, enum สถานะ และ RLS policies
- `supabase/dashboard-upgrade.sql` สำหรับเพิ่มข้อมูล housekeeping, payment, booking history, reviews, favorites, notifications และ hotel settings
- `supabase/dashboard-operations.sql` สำหรับสิทธิ์พนักงาน ฟิลด์อีเมลสมาชิก และ RPC เช็กอิน/เช็กเอาต์
- API health check ที่ `/api/health`
- ใช้ LINE Seed Sans TH เป็นฟอนต์หลักของระบบ เพื่อให้ภาษาไทยดูร่วมสมัยและอ่านง่ายบนหน้าจอ

ฟอนต์ LINE Seed Sans TH ดาวน์โหลดจาก [เว็บไซต์ทางการของ LINE](https://seed.line.me/index_th.html) และเผยแพร่ภายใต้ SIL Open Font License 1.1

## เริ่มต้นบนเครื่อง

ต้องใช้ Node.js 20.9+ และ pnpm/npm

```bash
pnpm install
copy .env.example .env.local
pnpm dev
```

ถ้ายังไม่มี Supabase ระบบหน้าเว็บและ dashboard จะเปิดในโหมด demo ได้ ส่วน login จะแจ้งว่าให้ตั้งค่า Supabase ก่อน

## เชื่อม Supabase

1. สร้างโปรเจกต์ที่ Supabase
2. เปิด SQL Editor แล้วรันไฟล์ `supabase/schema.sql`
3. เปิด SQL Editor แล้วรันไฟล์ `supabase/dashboard-upgrade.sql` ต่ออีกครั้ง เพื่อเพิ่มตาราง/ฟีเจอร์สำหรับ Dashboard และงานหลังบ้าน
4. เปิด SQL Editor แล้วรันไฟล์ `supabase/dashboard-operations.sql` เพื่อเปิดสิทธิ์งานพนักงานและฟังก์ชันเช็กอิน/เช็กเอาต์
5. คัดลอก Project URL และ Publishable key ใส่ใน `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

ควรตั้งค่า Auth > URL Configuration ให้ Site URL เป็น URL ของ Vercel และเพิ่ม Redirect URL ที่ใช้จริงก่อนทดสอบ production

## การกำหนด Role

บัญชีที่สมัครจากหน้า `/login` จะได้ role `customer` เท่านั้น เพื่อป้องกันการสมัครสิทธิ์พนักงานเอง หลังสร้างบัญชีพนักงานแล้ว ให้ผู้ดูแลรันคำสั่งใน Supabase SQL Editor โดยเปลี่ยนอีเมลให้ตรงกับบัญชีจริง

```sql
update public.profiles
set role = 'receptionist'
where id = (select id from auth.users where email = 'staff@example.com');
```

รองรับ role `customer`, `receptionist`, `manager` และ `admin` โดย customer จะไปหน้า `/account` ส่วน role พนักงานจะไป `/dashboard` และฐานข้อมูลมี trigger ป้องกันการแก้ role โดยผู้ใช้ทั่วไป

## Deploy บน Vercel

เชื่อม Git repository เข้ากับ Vercel แล้วเพิ่ม environment variables ชุดเดียวกับ `.env.local` ใน Project Settings > Environment Variables จากนั้น deploy ได้ทันที เพราะโปรเจกต์ใช้ Next.js App Router และไม่มี custom server

ตรวจสอบก่อน deploy:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## หน้าหลังบ้านตามขอบเขตโครงงาน

- `/dashboard/bookings` จัดการการจอง ยืนยัน ยกเลิก และสถานะการชำระเงิน
- `/dashboard/rooms` จัดการประเภทห้อง ห้องพัก ราคา สิ่งอำนวยความสะดวก และ housekeeping
- `/dashboard/customers` ตรวจสอบสมาชิก ประวัติการจอง และสิทธิ์การใช้งาน
- `/dashboard/front-desk` เช็กอิน/เช็กเอาต์และปรับสถานะห้องผ่าน RPC ที่จำกัดสิทธิ์พนักงาน
- `/dashboard/reports` รายงานการจอง รายได้ อัตราการเข้าพัก และสถิติ

## แนวทางต่อยอดที่แนะนำ

- ทำฟังก์ชันป้องกัน booking ซ้อนด้วย Postgres exclusion constraint หรือ transaction/RPC
- เพิ่มระบบชำระเงิน, email notification, QR check-in และ audit log
- แยก route group `(marketing)`, `(auth)`, `(dashboard)` เมื่อหน้าระบบเพิ่มขึ้น
