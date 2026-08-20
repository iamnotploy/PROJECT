import Link from "next/link";
import { ArrowUpRight, ShieldCheck, UserCog, Users } from "lucide-react";
import { roleLabels, type AppRole } from "@/lib/auth";

export type AdminDashboardData = {
  totalUsers: number;
  customerCount: number;
  staffCount: number;
  adminCount: number;
  recentUsers: { id: string; name: string; email: string; role: AppRole; createdAt: string }[];
};

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const cards = [
    { label: "ผู้ใช้งานทั้งหมด", value: data.totalUsers, caption: "บัญชีในแพลตฟอร์ม", tone: "bg-brand-100 text-brand-700" },
    { label: "ลูกค้า", value: data.customerCount, caption: "ผู้ใช้บริการจองที่พัก", tone: "bg-[#f1edff] text-[#6a52b3]" },
    { label: "ทีมโรงแรม", value: data.staffCount, caption: "พนักงานและผู้จัดการ", tone: "bg-[#fff4d8] text-[#9a6b08]" },
    { label: "Admin", value: data.adminCount, caption: "ผู้ดูแลแพลตฟอร์ม", tone: "bg-coral-50 text-coral-600" },
  ];

  return <section className="space-y-6">
    <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-bold text-[#6a52b3]"><ShieldCheck className="size-3" /> LUMA PLATFORM ADMIN</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">ภาพรวมแพลตฟอร์ม</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-ink">ศูนย์ควบคุมของเจ้าของเว็บ ดูแลบัญชีผู้ใช้งานและสิทธิ์ของทีมโรงแรม ส่วนรายละเอียดห้องพัก การจอง และการปฏิบัติงานอยู่ในความรับผิดชอบของผู้จัดการโรงแรม</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, caption, tone }) => <div key={label} className="rounded-2xl border bg-white p-5"><span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Users className="size-4" /></span><p className="mt-5 text-xs font-medium text-muted-ink">{label}</p><p className="mt-1 text-2xl font-black tracking-tight">{value.toLocaleString("th-TH")}</p><p className="mt-1 text-[11px] text-muted-ink">{caption}</p></div>)}</div>
    <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <section className="overflow-hidden rounded-2xl border bg-white"><div className="flex items-center justify-between border-b px-5 py-4"><div><h3 className="text-sm font-black">บัญชีล่าสุด</h3><p className="mt-1 text-[11px] text-muted-ink">ตรวจสอบสมาชิกและทีมโรงแรมที่เข้าระบบ</p></div><Link href="/dashboard/users" className="text-xs font-bold text-brand-700 hover:text-brand-900">จัดการสิทธิ์ <ArrowUpRight className="ml-1 inline size-3.5" /></Link></div>{data.recentUsers.length ? <div className="divide-y">{data.recentUsers.map((user) => <div key={user.id} className="flex items-center gap-3 px-5 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-black text-brand-800">{user.name.slice(0, 2)}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{user.name}</p><p className="mt-1 truncate text-[11px] text-muted-ink">{user.email || "ไม่มีอีเมล"} · {user.createdAt}</p></div><span className="shrink-0 rounded-full bg-[#f5f8f7] px-2 py-1 text-[10px] font-bold text-muted-ink">{roleLabels[user.role]}</span></div>)}</div> : <p className="px-5 py-12 text-center text-sm text-muted-ink">ยังไม่มีข้อมูลผู้ใช้งาน</p>}</section>
      <section className="rounded-2xl bg-brand-900 p-5 text-white lg:p-6"><div className="flex items-start justify-between"><div><p className="text-xs text-white/55">ขอบเขตของ Admin</p><h3 className="mt-1 text-xl font-black">Platform only</h3></div><span className="grid size-10 place-items-center rounded-xl bg-white/10"><ShieldCheck className="size-5 text-brand-300" /></span></div><div className="mt-7 space-y-3 text-xs"><StatusRow label="จัดการบัญชีและ Role" value="เปิดใช้งาน" /><StatusRow label="เปลี่ยน Role ตัวเอง" value="ป้องกันไว้" /><StatusRow label="ข้อมูลโรงแรม" value="ให้ Manager ดูแล" /></div><p className="mt-6 border-t border-white/10 pt-4 text-[11px] leading-5 text-white/55">Admin จะไม่ปะปนกับงานจอง เช็กอิน เช็กเอาต์ หรือรายละเอียดการดำเนินงานของโรงแรม</p></section>
    </div>
    <section><div className="mb-3"><h3 className="text-sm font-black">เครื่องมือเจ้าของแพลตฟอร์ม</h3><p className="mt-1 text-[11px] text-muted-ink">ระบบที่ Admin ควรจัดการโดยตรง</p></div><Link href="/dashboard/users" className="group inline-flex w-full items-start gap-4 rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-[0_12px_30px_rgba(17,88,79,0.1)] sm:max-w-xl"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><UserCog className="size-5" /></span><span><p className="text-sm font-black">ผู้ใช้งานและสิทธิ์ <ArrowUpRight className="ml-1 inline size-4 text-muted-ink transition group-hover:text-brand-700" /></p><p className="mt-1 text-xs leading-5 text-muted-ink">กำหนดลูกค้า พนักงานต้อนรับ ผู้จัดการ และ Admin โดยไม่เข้าไปยุ่งกับข้อมูลการดำเนินงานโรงแรม</p></span></Link></section>
  </section>;
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-white/55">{label}</span><span className="font-bold text-brand-200">{value}</span></div>;
}
