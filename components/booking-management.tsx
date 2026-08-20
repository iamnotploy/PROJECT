"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Check, ChevronRight, LoaderCircle, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type BookingManagementRow = {
  id: string;
  bookingCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  dates: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  guestCount: number;
  createdAt: string;
};

const statusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  checked_in: "เข้าพักแล้ว",
  checked_out: "เช็กเอาต์แล้ว",
  cancelled: "ยกเลิก",
};

const paymentLabels: Record<string, string> = {
  unpaid: "ยังไม่ชำระ",
  pending: "กำลังตรวจสอบ",
  paid: "ชำระแล้ว",
  refunded: "คืนเงินแล้ว",
  failed: "ชำระไม่สำเร็จ",
};

function statusVariant(status: string) {
  if (status === "confirmed" || status === "checked_in") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "checked_out") return "outline" as const;
  return "warning" as const;
}

function paymentVariant(status: string) {
  if (status === "paid") return "success" as const;
  if (status === "failed" || status === "refunded") return "danger" as const;
  return "warning" as const;
}

export function BookingManagement({ initialRows }: { initialRows: BookingManagementRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesQuery = !query || [row.bookingCode, row.guestName, row.guestEmail, row.roomName, row.roomNumber].join(" ").toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (statusFilter === "all" || row.status === statusFilter);
  }), [query, rows, statusFilter]);

  async function updateBooking(id: string, patch: { status?: string; payment_status?: string }) {
    setBusyId(id);
    setMessage(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const payload: Record<string, string> = { ...patch };
      if (patch.status === "confirmed") payload.confirmed_at = now;
      if (patch.status === "cancelled") payload.cancelled_at = now;
      if (patch.status === "checked_in") payload.checked_in_at = now;
      if (patch.status === "checked_out") payload.checked_out_at = now;
      const { error } = await supabase.from("bookings").update(payload).eq("id", id);
      if (error) throw error;
      setRows((current) => current.map((row) => row.id === id ? { ...row, status: patch.status ?? row.status, paymentStatus: patch.payment_status ?? row.paymentStatus } : row));
      setMessage("อัปเดตรายการเรียบร้อยแล้ว");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่สามารถอัปเดตรายการได้");
    } finally {
      setBusyId(null);
    }
  }

  return <section className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold text-brand-800"><CalendarDays className="size-3" /> งานหน้าฟรอนต์</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">จัดการการจองห้องพัก</h2><p className="mt-2 text-sm text-muted-ink">ตรวจสอบ ยืนยัน แก้ไขสถานะ และติดตามการชำระเงินของผู้เข้าพัก</p></div>
      <Link href="/dashboard/front-desk"><Button variant="secondary" size="sm">เปิดกระดานเช็กอิน/เช็กเอาต์ <ChevronRight className="size-4" /></Button></Link>
    </div>
    <div className="grid gap-4 sm:grid-cols-3"><SummaryCard label="รายการทั้งหมด" value={rows.length} /><SummaryCard label="รอดำเนินการ" value={rows.filter((row) => row.status === "pending").length} tone="gold" /><SummaryCard label="ยืนยันแล้ว" value={rows.filter((row) => row.status === "confirmed").length} tone="brand" /></div>
    <div className="rounded-2xl border bg-white p-4"><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหารหัสจอง ชื่อลูกค้า หรือห้องพัก" className="h-11 w-full rounded-xl border bg-[#fbfcfb] pl-10 pr-3 text-sm outline-none focus:border-brand-400" /></label><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-xl border bg-white px-3 text-sm outline-none focus:border-brand-400"><option value="all">ทุกสถานะ</option><option value="pending">รอดำเนินการ</option><option value="confirmed">ยืนยันแล้ว</option><option value="checked_in">เข้าพักแล้ว</option><option value="checked_out">เช็กเอาต์แล้ว</option><option value="cancelled">ยกเลิก</option></select></div></div>
    {message && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}
    <div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead><tr className="border-b bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-muted-ink"><th className="px-5 py-3">รหัสจอง</th><th className="px-5 py-3">ผู้เข้าพัก</th><th className="px-5 py-3">ห้องพัก</th><th className="px-5 py-3">วันเข้าพัก</th><th className="px-5 py-3">สถานะ</th><th className="px-5 py-3">การชำระเงิน</th><th className="px-5 py-3 text-right">ยอดรวม</th><th className="px-5 py-3 text-right">จัดการ</th></tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id} className="border-b align-top last:border-0"><td className="px-5 py-4"><p className="text-xs font-black text-brand-700">{row.bookingCode}</p><p className="mt-1 text-[10px] text-muted-ink">{row.createdAt}</p></td><td className="px-5 py-4"><p className="text-xs font-bold">{row.guestName}</p><p className="mt-1 text-[11px] text-muted-ink">{row.guestEmail}</p><p className="text-[11px] text-muted-ink">{row.guestPhone || "ไม่มีเบอร์โทร"}</p></td><td className="px-5 py-4"><p className="text-xs font-semibold">{row.roomName}</p><p className="mt-1 text-[11px] text-muted-ink">ห้อง {row.roomNumber} · {row.guestCount} ผู้เข้าพัก</p></td><td className="px-5 py-4 text-xs text-muted-ink">{row.dates}</td><td className="px-5 py-4"><select aria-label={`สถานะ ${row.bookingCode}`} disabled={busyId === row.id} value={row.status} onChange={(event) => updateBooking(row.id, { status: event.target.value })} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold outline-none focus:border-brand-400"><option value="pending">รอดำเนินการ</option><option value="confirmed">ยืนยันแล้ว</option><option value="checked_in">เข้าพักแล้ว</option><option value="checked_out">เช็กเอาต์แล้ว</option><option value="cancelled">ยกเลิก</option></select><div className="mt-2"><Badge variant={statusVariant(row.status)}>{statusLabels[row.status] ?? row.status}</Badge></div></td><td className="px-5 py-4"><select aria-label={`การชำระเงิน ${row.bookingCode}`} disabled={busyId === row.id} value={row.paymentStatus} onChange={(event) => updateBooking(row.id, { payment_status: event.target.value })} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold outline-none focus:border-brand-400"><option value="unpaid">ยังไม่ชำระ</option><option value="pending">กำลังตรวจสอบ</option><option value="paid">ชำระแล้ว</option><option value="refunded">คืนเงินแล้ว</option><option value="failed">ชำระไม่สำเร็จ</option></select><div className="mt-2"><Badge variant={paymentVariant(row.paymentStatus)}>{paymentLabels[row.paymentStatus] ?? row.paymentStatus}</Badge></div></td><td className="px-5 py-4 text-right text-xs font-black">฿{row.totalPrice.toLocaleString("th-TH")}</td><td className="px-5 py-4 text-right">{busyId === row.id ? <LoaderCircle className="ml-auto size-4 animate-spin text-brand-600" /> : row.status !== "cancelled" ? <button type="button" onClick={() => updateBooking(row.id, { status: "cancelled" })} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-coral-600 hover:bg-coral-50"><X className="size-3.5" />ยกเลิก</button> : <span className="text-xs text-muted-ink">ยกเลิกแล้ว</span>}</td></tr>)}</tbody></table></div>{filteredRows.length === 0 && <div className="px-5 py-16 text-center"><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Check className="size-5" /></div><p className="mt-3 text-sm font-bold">ยังไม่มีรายการตามตัวกรอง</p><p className="mt-1 text-xs text-muted-ink">เมื่อมีการจองใหม่ รายการจะแสดงในหน้านี้</p></div>}</div>
  </section>;
}

function SummaryCard({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "gold" | "brand" }) {
  return <div className="rounded-2xl border bg-white p-5"><p className="text-xs font-medium text-muted-ink">{label}</p><p className={`mt-2 text-2xl font-black ${tone === "brand" ? "text-brand-700" : tone === "gold" ? "text-[#9a6b08]" : "text-ink"}`}>{value.toLocaleString("th-TH")}</p></div>;
}
