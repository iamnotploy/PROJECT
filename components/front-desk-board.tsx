"use client";

import { useMemo, useState } from "react";
import { CalendarCheck2, CheckCircle2, Clock3, DoorOpen, LogOut, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export type FrontDeskRow = { id: string; bookingCode: string; guestName: string; guestPhone: string; roomId: string; roomNumber: string; roomName: string; checkIn: string; checkOut: string; status: string; paymentStatus: string };
const labels: Record<string, string> = { pending: "รอดำเนินการ", confirmed: "ยืนยันแล้ว", checked_in: "เข้าพักแล้ว", checked_out: "เช็กเอาต์แล้ว", cancelled: "ยกเลิก" };

function todayKey() { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date()); }

export function FrontDeskBoard({ initialRows }: { initialRows: FrontDeskRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [tab, setTab] = useState<"arrivals" | "departures" | "all">("arrivals");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const today = todayKey();
  const filtered = useMemo(() => rows.filter((row) => row.status !== "cancelled" && (tab === "all" || (tab === "arrivals" ? row.checkIn === today : row.checkOut === today))), [rows, tab, today]);
  const arrivals = rows.filter((row) => row.checkIn === today && row.status !== "cancelled").length;
  const departures = rows.filter((row) => row.checkOut === today && row.status !== "cancelled").length;

  async function changeStatus(row: FrontDeskRow, status: string) {
    setBusyId(row.id);
    setMessage(null);
    try {
      const supabase = createClient();
      const now = new Date().toISOString();
      const bookingPatch: Record<string, string> = { status };
      if (status === "confirmed") bookingPatch.confirmed_at = now;
      if (status === "checked_in") bookingPatch.checked_in_at = now;
      if (status === "checked_out") bookingPatch.checked_out_at = now;
      if (status === "cancelled") bookingPatch.cancelled_at = now;
      const { error: bookingError } = await supabase.from("bookings").update(bookingPatch).eq("id", row.id);
      if (bookingError) throw bookingError;
      const roomStatus = status === "checked_in" ? "occupied" : status === "checked_out" || status === "cancelled" ? "available" : status === "confirmed" ? "reserved" : null;
      if (roomStatus) {
        const { error: roomError } = await supabase.rpc("front_desk_update_room", { p_room_id: row.roomId, p_status: roomStatus, p_housekeeping_status: status === "checked_out" ? "dirty" : null });
        if (roomError) throw roomError;
      }
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status } : item));
      setMessage(`อัปเดต ${row.bookingCode} เป็น ${labels[status] ?? status} แล้ว`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ไม่สามารถอัปเดตงานหน้าฟรอนต์ได้");
    } finally { setBusyId(null); }
  }

  return <section className="space-y-6">
    <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-bold text-[#9a6b08]"><DoorOpen className="size-3" /> Front desk</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">เช็กอินและเช็กเอาต์</h2><p className="mt-2 text-sm text-muted-ink">ตรวจสอบผู้เข้าพักวันนี้ ยืนยันการเข้าพัก และคืนสถานะห้องหลังเช็กเอาต์</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><DeskCard icon={DoorOpen} label="ผู้เข้าพักวันนี้" value={arrivals} tone="gold" /><DeskCard icon={LogOut} label="ออกวันนี้" value={departures} tone="brand" /><DeskCard icon={Clock3} label="รอดำเนินการ" value={rows.filter((row) => row.status === "pending").length} tone="coral" /></div>
    {message && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}
    <div className="flex gap-2 rounded-2xl border bg-white p-2"><button type="button" onClick={() => setTab("arrivals")} className={`rounded-xl px-4 py-2.5 text-xs font-bold ${tab === "arrivals" ? "bg-brand-600 text-white" : "text-muted-ink hover:bg-brand-50"}`}>เข้าวันนี้ ({arrivals})</button><button type="button" onClick={() => setTab("departures")} className={`rounded-xl px-4 py-2.5 text-xs font-bold ${tab === "departures" ? "bg-brand-600 text-white" : "text-muted-ink hover:bg-brand-50"}`}>ออกวันนี้ ({departures})</button><button type="button" onClick={() => setTab("all")} className={`rounded-xl px-4 py-2.5 text-xs font-bold ${tab === "all" ? "bg-brand-600 text-white" : "text-muted-ink hover:bg-brand-50"}`}>ทั้งหมด</button></div>
    <div className="grid gap-4 lg:grid-cols-2">{filtered.map((row) => <article key={row.id} className="rounded-2xl border bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black text-brand-700">{row.bookingCode}</p><h3 className="mt-1 text-base font-black">{row.guestName}</h3><p className="mt-1 text-xs text-muted-ink">{row.guestPhone || "ไม่มีเบอร์โทร"}</p></div><Badge variant={row.status === "checked_in" ? "success" : row.status === "checked_out" ? "outline" : "warning"}>{labels[row.status] ?? row.status}</Badge></div><div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-[#fbfcfb] p-3 text-xs"><div><p className="text-muted-ink">ห้องพัก</p><p className="mt-1 font-bold">{row.roomName} · {row.roomNumber}</p></div><div><p className="text-muted-ink">การชำระเงิน</p><p className="mt-1 font-bold">{row.paymentStatus === "paid" ? "ชำระแล้ว" : "รอตรวจสอบ"}</p></div><div><p className="text-muted-ink">วันเข้า</p><p className="mt-1 font-bold">{row.checkIn}</p></div><div><p className="text-muted-ink">วันออก</p><p className="mt-1 font-bold">{row.checkOut}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{row.status === "pending" && <ActionButton icon={CheckCircle2} label="ยืนยันการจอง" onClick={() => changeStatus(row, "confirmed")} busy={busyId === row.id} />}{row.status === "confirmed" && <ActionButton icon={DoorOpen} label="เช็กอิน" onClick={() => changeStatus(row, "checked_in")} busy={busyId === row.id} />}{row.status === "checked_in" && <ActionButton icon={LogOut} label="เช็กเอาต์" onClick={() => changeStatus(row, "checked_out")} busy={busyId === row.id} />}{row.status !== "checked_out" && <ActionButton icon={RefreshCw} label="ยกเลิก" kind="danger" onClick={() => changeStatus(row, "cancelled")} busy={busyId === row.id} />}</div></article>)}{filtered.length === 0 && <div className="rounded-2xl border bg-white px-5 py-16 text-center lg:col-span-2"><CalendarCheck2 className="mx-auto size-7 text-brand-600" /><p className="mt-3 text-sm font-bold">ไม่มีรายการในช่วงนี้</p><p className="mt-1 text-xs text-muted-ink">เมื่อมีการจอง ระบบจะแสดงงานหน้าฟรอนต์ที่นี่</p></div>}</div>
  </section>;
}

function DeskCard({ icon: Icon, label, value, tone }: { icon: typeof DoorOpen; label: string; value: number; tone: "gold" | "brand" | "coral" }) {
  const colors = { gold: "bg-[#fff4d8] text-[#9a6b08]", brand: "bg-brand-100 text-brand-700", coral: "bg-coral-50 text-coral-600" };
  return <div className="rounded-2xl border bg-white p-5"><span className={`grid size-9 place-items-center rounded-xl ${colors[tone]}`}><Icon className="size-4" /></span><p className="mt-4 text-xs text-muted-ink">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function ActionButton({ icon: Icon, label, onClick, busy, kind = "default" }: { icon: typeof DoorOpen; label: string; onClick: () => void; busy: boolean; kind?: "default" | "danger" }) {
  return <button type="button" disabled={busy} onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${kind === "danger" ? "bg-coral-50 text-coral-600 hover:bg-coral-100" : "bg-brand-600 text-white hover:bg-brand-700"}`}>{busy ? <RefreshCw className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}{label}</button>;
}
