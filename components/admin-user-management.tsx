"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/auth";

export type AdminUserRow = { id: string; name: string; email: string; phone: string; role: AppRole; createdAt: string };

const roleLabels: Record<AppRole, string> = { customer: "ลูกค้า", receptionist: "พนักงานต้อนรับ", manager: "ผู้จัดการ", admin: "ผู้ดูแลระบบ" };

export function AdminUserManagement({ initialRows, currentUserId }: { initialRows: AdminUserRow[]; currentUserId: string }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const filtered = useMemo(() => rows.filter((row) => [row.name, row.email, row.phone, roleLabels[row.role]].join(" ").toLowerCase().includes(query.toLowerCase())), [query, rows]);

  async function updateRole(row: AdminUserRow, role: AppRole) {
    setMessage(null);
    if (row.id === currentUserId) {
      setMessage("ไม่สามารถเปลี่ยน Role ของบัญชี Admin ที่กำลังใช้งานอยู่ได้");
      return;
    }
    const { error } = await createClient().from("profiles").update({ role }).eq("id", row.id);
    if (error) setMessage(error.message);
    else { setRows((current) => current.map((item) => item.id === row.id ? { ...item, role } : item)); setMessage(`อัปเดตสิทธิ์ของ ${row.name} แล้ว`); }
  }

  return <section className="space-y-6"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-bold text-[#6a52b3]"><ShieldCheck className="size-3" /> PLATFORM ACCESS CONTROL</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">ผู้ใช้งานและสิทธิ์</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-ink">Admin จัดการสิทธิ์บัญชีได้จากส่วนนี้เท่านั้น รายละเอียดการจองและข้อมูลการดำเนินงานโรงแรมให้ทีม Manager ดูแล</p></div><div className="grid gap-4 sm:grid-cols-4"><Summary label="ทั้งหมด" value={rows.length} /><Summary label="ลูกค้า" value={rows.filter((row) => row.role === "customer").length} tone="text-brand-700" /><Summary label="ทีมโรงแรม" value={rows.filter((row) => row.role === "receptionist" || row.role === "manager").length} tone="text-[#9a6b08]" /><Summary label="Admin" value={rows.filter((row) => row.role === "admin").length} tone="text-[#6a52b3]" /></div><div className="rounded-2xl border bg-white p-4"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ อีเมล เบอร์โทร หรือ Role" className="h-11 w-full rounded-xl border bg-[#fbfcfb] pl-10 pr-3 text-sm outline-none focus:border-brand-400" /></div></div>{message && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}<div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-muted-ink"><th className="px-5 py-3">บัญชี</th><th className="px-5 py-3">ติดต่อ</th><th className="px-5 py-3">สมัครเมื่อ</th><th className="px-5 py-3">สิทธิ์การใช้งาน</th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id} className="border-b last:border-0"><td className="px-5 py-4"><p className="text-xs font-black">{row.name || "ยังไม่ระบุชื่อ"}</p>{row.id === currentUserId && <span className="mt-1 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">บัญชีที่กำลังใช้งาน</span>}</td><td className="px-5 py-4"><p className="text-xs text-muted-ink">{row.email || "ไม่มีอีเมล"}</p><p className="mt-1 text-xs text-muted-ink">{row.phone || "ไม่มีเบอร์โทร"}</p></td><td className="px-5 py-4 text-xs text-muted-ink">{row.createdAt}</td><td className="px-5 py-4"><select aria-label={`สิทธิ์ ${row.name}`} disabled={row.id === currentUserId} value={row.role} onChange={(event) => updateRole(row, event.target.value as AppRole)} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold outline-none disabled:cursor-not-allowed disabled:bg-[#f5f8f7] focus:border-brand-400"><option value="customer">ลูกค้า</option><option value="receptionist">พนักงานต้อนรับ</option><option value="manager">ผู้จัดการ</option><option value="admin">ผู้ดูแลระบบ</option></select>{row.id === currentUserId && <p className="mt-1 text-[10px] text-muted-ink">เปลี่ยน Role ตัวเองไม่ได้</p>}</td></tr>)}</tbody></table></div>{filtered.length === 0 && <div className="px-5 py-16 text-center text-sm text-muted-ink">ไม่พบผู้ใช้งานตามคำค้นหา</div>}</div></section>;
}

function Summary({ label, value, tone = "text-ink" }: { label: string; value: number; tone?: string }) {
  return <div className="rounded-2xl border bg-white p-5"><p className="text-xs text-muted-ink">{label}</p><p className={`mt-2 text-2xl font-black ${tone}`}>{value.toLocaleString("th-TH")}</p></div>;
}
