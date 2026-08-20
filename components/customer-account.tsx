"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Check, Mail, Phone, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/client";

export type CustomerBooking = { id: string; bookingCode: string; checkIn: string; checkOut: string; status: string; totalPrice: number };

const statusLabels: Record<string, string> = { pending: "รอดำเนินการ", confirmed: "ยืนยันแล้ว", checked_in: "เข้าพักแล้ว", checked_out: "เช็กเอาต์แล้ว", cancelled: "ยกเลิก" };

function statusVariant(status: string) {
  if (status === "confirmed" || status === "checked_in") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  if (status === "checked_out") return "outline" as const;
  return "warning" as const;
}

export function CustomerAccount({ userId, name, email, phone, roleLabel, initialBookings }: { userId: string; name: string; email: string; phone: string; roleLabel: string; initialBookings: CustomerBooking[] }) {
  const [fullName, setFullName] = useState(name);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState(initialBookings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    const { error: updateError } = await createClient().from("profiles").update({ full_name: fullName.trim(), phone: phoneNumber.trim() || null }).eq("id", userId);
    if (updateError) setError(updateError.message);
    else { setEditing(false); setMessage("บันทึกข้อมูลส่วนตัวแล้ว"); }
    setBusy(false);
  }

  async function cancelBooking(booking: CustomerBooking) {
    if (!window.confirm(`ต้องการยกเลิกการจอง ${booking.bookingCode} หรือไม่?`)) return;
    setBusy(true);
    setMessage(null);
    setError(null);
    const { error: cancelError } = await createClient().rpc("customer_cancel_booking", { p_booking_id: booking.id, p_reason: "ยกเลิกโดยผู้ใช้งาน" });
    if (cancelError) setError(cancelError.message);
    else { setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: "cancelled" } : item)); setMessage(`ยกเลิก ${booking.bookingCode} แล้ว`); }
    setBusy(false);
  }

  return <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">บัญชีของฉัน</p><h1 className="mt-2 text-3xl font-black tracking-tight">สวัสดีครับ {fullName || email}</h1><p className="mt-2 text-sm text-muted-ink">จัดการข้อมูลส่วนตัวและดูรายการจองของคุณ</p></div>{message && <div className="mb-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"><Check className="size-4" />{message}</div>}{error && <div className="mb-5 flex items-center gap-2 rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-600"><X className="size-4" />{error}</div>}<div className="grid gap-5 lg:grid-cols-[320px_1fr]"><aside className="h-fit rounded-2xl border bg-white p-5"><div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-brand-100 text-brand-700"><UserRound className="size-5" /></span><div className="min-w-0"><p className="truncate text-sm font-bold">{fullName || "ผู้ใช้งาน LUMA"}</p><p className="truncate text-xs text-muted-ink">{email}</p></div></div><div className="mt-5 flex items-center gap-2 rounded-xl bg-brand-50 p-3 text-xs font-bold text-brand-800"><ShieldCheck className="size-4" /> {roleLabel}</div><div className="mt-5 space-y-3 border-t pt-5 text-xs text-muted-ink"><p className="flex items-center gap-2"><Mail className="size-3.5 text-brand-600" />{email}</p><p className="flex items-center gap-2"><Phone className="size-3.5 text-brand-600" />{phoneNumber || "ยังไม่ได้เพิ่มเบอร์โทร"}</p></div><SignOutButton variant="outline" className="mt-5 w-full" /></aside><div className="space-y-5"><section className="rounded-2xl border bg-white p-5 sm:p-7"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-black">ข้อมูลส่วนตัว</h2><p className="mt-1 text-sm text-muted-ink">ข้อมูลนี้ใช้สำหรับติดต่อและยืนยันการจอง</p></div>{!editing && <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>แก้ไขข้อมูล</Button>}</div>{editing ? <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-muted-ink"><span>ชื่อ-นามสกุล</span><input required value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-11 rounded-xl border px-3 text-sm font-normal text-ink outline-none focus:border-brand-400" /></label><label className="grid gap-1 text-xs font-bold text-muted-ink"><span>เบอร์โทรศัพท์</span><input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="h-11 rounded-xl border px-3 text-sm font-normal text-ink outline-none focus:border-brand-400" /></label><label className="grid gap-1 text-xs font-bold text-muted-ink sm:col-span-2"><span>อีเมล <small className="font-normal text-muted-ink">(เปลี่ยนผ่านระบบยืนยันอีเมล)</small></span><input value={email} readOnly className="h-11 rounded-xl border bg-[#f5f8f7] px-3 text-sm text-muted-ink outline-none" /></label><div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={busy}><Save className="size-4" />บันทึกข้อมูล</Button><Button type="button" variant="ghost" onClick={() => { setEditing(false); setFullName(name); setPhoneNumber(phone); }}>ยกเลิก</Button></div></form> : <div className="mt-5 grid gap-4 sm:grid-cols-2"><Info label="ชื่อ-นามสกุล" value={fullName || "ยังไม่ได้เพิ่มชื่อ"} /><Info label="เบอร์โทรศัพท์" value={phoneNumber || "ยังไม่ได้เพิ่มเบอร์โทร"} /><Info label="อีเมล" value={email} /><Info label="ประเภทบัญชี" value={roleLabel} /></div>}</section><section className="rounded-2xl border bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">รายการจองของฉัน</h2><p className="mt-1 text-sm text-muted-ink">ตรวจสอบสถานะและจัดการการจองของคุณ</p></div><Badge variant="outline">{bookings.length} รายการ</Badge></div>{bookings.length ? <div className="mt-6 space-y-3">{bookings.map((booking) => <div key={booking.id} className="rounded-xl border p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-bold text-brand-800">{booking.bookingCode}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-ink"><CalendarDays className="size-3.5" /> {booking.checkIn} – {booking.checkOut}</p></div><div className="flex items-center justify-between gap-4 sm:justify-end"><Badge variant={statusVariant(booking.status)}>{statusLabels[booking.status] ?? booking.status}</Badge><span className="text-sm font-black">฿{booking.totalPrice.toLocaleString("th-TH")}</span></div></div>{(booking.status === "pending" || booking.status === "confirmed") && <div className="mt-3 border-t pt-3 text-right"><button type="button" disabled={busy} onClick={() => cancelBooking(booking)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-coral-600 hover:bg-coral-50 disabled:opacity-50"><X className="size-3.5" />ยกเลิกการจอง</button></div>}</div>)}</div> : <div className="mt-6 rounded-xl border border-dashed bg-[#fcfdfc] p-10 text-center"><p className="font-bold">ยังไม่มีรายการจอง</p><p className="mt-1 text-sm text-muted-ink">เริ่มค้นหาที่พักในมุกดาหารได้เลย</p></div>}</section></div></div></div>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#fbfcfb] p-3"><p className="text-[11px] text-muted-ink">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>;
}
