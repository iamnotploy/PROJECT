"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export type CustomerHistoryRow = { id: string; userId: string | null; bookingCode: string; room: string; dates: string; status: string; amount: number };
export type CustomerManagementRow = { id: string; name: string; email: string; phone: string; role: string; createdAt: string; bookingCount: number; stayCount: number; totalSpent: number };

const roleLabels: Record<string, string> = { customer: "ลูกค้า", receptionist: "พนักงานต้อนรับ", manager: "ผู้จัดการ", admin: "ผู้ดูแลระบบ" };
const statusLabels: Record<string, string> = { pending: "รอดำเนินการ", confirmed: "ยืนยันแล้ว", checked_in: "เข้าพักแล้ว", checked_out: "เช็กเอาต์แล้ว", cancelled: "ยกเลิก" };

export function CustomerManagement({ initialRows, history, currentRole }: { initialRows: CustomerManagementRow[]; history: CustomerHistoryRow[]; currentRole: string }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const filtered = useMemo(() => rows.filter((row) => [row.name, row.email, row.phone, roleLabels[row.role]].join(" ").toLowerCase().includes(query.toLowerCase())), [query, rows]);
  const canChangeRole = currentRole === "admin";

  async function updateRole(id: string, role: string) {
    setMessage(null);
    const { error } = await createClient().from("profiles").update({ role }).eq("id", id);
    if (error) setMessage(error.message);
    else { setRows((current) => current.map((row) => row.id === id ? { ...row, role } : row)); setMessage("อัปเดตสิทธิ์ผู้ใช้งานแล้ว"); }
  }

  return <section className="space-y-6">
    <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-bold text-[#6a52b3]"><ShieldCheck className="size-3" /> CUSTOMER OPERATIONS</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">จัดการข้อมูลลูกค้า</h2><p className="mt-2 text-sm text-muted-ink">ตรวจสอบสมาชิก ประวัติการจอง และประวัติการเข้าพักของโรงแรม</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-muted-ink">สมาชิกทั้งหมด</p><p className="mt-2 text-2xl font-black">{rows.length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-muted-ink">ลูกค้า</p><p className="mt-2 text-2xl font-black text-brand-700">{rows.filter((row) => row.role === "customer").length}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-xs text-muted-ink">ผู้ดูแลระบบ/พนักงาน</p><p className="mt-2 text-2xl font-black text-[#6a52b3]">{rows.filter((row) => row.role !== "customer").length}</p></div></div>
    <div className="rounded-2xl border bg-white p-4"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ อีเมล หรือเบอร์โทร" className="h-11 w-full rounded-xl border bg-[#fbfcfb] pl-10 pr-3 text-sm outline-none focus:border-brand-400" /></div></div>
    {message && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}
    <div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead><tr className="border-b bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-muted-ink"><th className="px-5 py-3">สมาชิก</th><th className="px-5 py-3">ติดต่อ</th><th className="px-5 py-3">การจอง</th><th className="px-5 py-3">ยอดใช้บริการ</th><th className="px-5 py-3">สิทธิ์</th><th className="px-5 py-3 text-right">ประวัติ</th></tr></thead><tbody>{filtered.map((row) => <Fragment key={row.id}><tr className="border-b"><td className="px-5 py-4"><p className="text-xs font-black">{row.name || "ยังไม่ระบุชื่อ"}</p><p className="mt-1 text-[10px] text-muted-ink">สมัครเมื่อ {row.createdAt}</p></td><td className="px-5 py-4"><p className="text-xs text-muted-ink">{row.email || "ไม่มีอีเมล"}</p><p className="mt-1 text-xs text-muted-ink">{row.phone || "ไม่มีเบอร์โทร"}</p></td><td className="px-5 py-4"><p className="text-xs font-bold">{row.bookingCount} รายการ</p><p className="mt-1 text-[11px] text-muted-ink">เข้าพักแล้ว {row.stayCount} ครั้ง</p></td><td className="px-5 py-4 text-xs font-black">฿{row.totalSpent.toLocaleString("th-TH")}</td><td className="px-5 py-4"><select aria-label={`สิทธิ์ ${row.name}`} disabled={!canChangeRole} value={row.role} onChange={(event) => updateRole(row.id, event.target.value)} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold outline-none disabled:bg-[#f5f8f7] focus:border-brand-400"><option value="customer">ลูกค้า</option><option value="receptionist">พนักงานต้อนรับ</option><option value="manager">ผู้จัดการ</option><option value="admin">ผู้ดูแลระบบ</option></select>{!canChangeRole && <p className="mt-1 text-[10px] text-muted-ink">เฉพาะ admin แก้สิทธิ์ได้</p>}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => setExpanded(expanded === row.id ? null : row.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50">ดูรายการ <ChevronDown className={`size-3.5 transition ${expanded === row.id ? "rotate-180" : ""}`} /></button></td></tr>{expanded === row.id && <tr className="border-b bg-brand-50/40"><td colSpan={6} className="px-5 py-4"><div className="grid gap-2">{history.filter((item) => item.userId === row.id).map((item) => <div key={item.id} className="flex flex-col justify-between gap-2 rounded-xl border bg-white p-3 text-xs sm:flex-row sm:items-center"><div><span className="font-black text-brand-700">{item.bookingCode}</span><span className="ml-3 text-muted-ink">{item.room} · {item.dates}</span></div><div className="flex items-center gap-3"><Badge variant={item.status === "cancelled" ? "danger" : item.status === "checked_out" ? "outline" : "success"}>{statusLabels[item.status] ?? item.status}</Badge><span className="font-black">฿{item.amount.toLocaleString("th-TH")}</span></div></div>)}{history.filter((item) => item.userId === row.id).length === 0 && <p className="py-3 text-xs text-muted-ink">ยังไม่มีประวัติการจอง</p>}</div></td></tr>}</Fragment>)}</tbody></table></div>{filtered.length === 0 && <div className="px-5 py-16 text-center text-sm text-muted-ink">ไม่พบสมาชิกตามคำค้นหา</div>}</div>
  </section>;
}
