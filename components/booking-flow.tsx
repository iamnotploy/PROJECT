"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, CalendarDays, Check, ChevronRight, CreditCard, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import type { Room } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { RoomAmenities, RoomFacts } from "@/components/room-detail";

const steps = ["รายละเอียดการเข้าพัก", "ข้อมูลผู้เข้าพัก", "ยืนยันการจอง"];

export function BookingFlow({ room }: { room: Room }) {
  const [step, setStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", note: "" });
  const nights = 2;
  const total = room.price * nights;

  if (confirmed) return <Confirmation room={room} bookingCode={bookingCode} total={total} />;

  function nextStep() {
    setError("");
    if (step === 1 && (!form.name.trim() || !form.email.trim())) {
      setError("กรุณากรอกชื่อและอีเมลก่อนดำเนินการต่อ");
      return;
    }
    setStep((value) => value + 1);
  }

  async function submitBooking() {
    if (!form.name.trim() || !form.email.trim()) {
      setError("กรุณากรอกชื่อและอีเมลของผู้เข้าพักให้ครบ");
      setStep(1);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const newBookingCode = `LM-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
      const { error: insertError } = await supabase.from("bookings").insert({
        booking_code: newBookingCode,
        user_id: user?.id ?? null,
        room_id: room.id,
        guest_name: form.name.trim(),
        guest_email: form.email.trim(),
        guest_phone: form.phone.trim() || null,
        check_in: "2026-08-21",
        check_out: "2026-08-23",
        guest_count: room.guests,
        status: "pending",
        nightly_price: room.price,
        total_price: total,
        special_request: form.note.trim() || null,
      });

      if (insertError) throw insertError;
      setBookingCode(newBookingCode);
      setConfirmed(true);
    } catch (submitError) {
      setError(friendlyBookingError(submitError));
    } finally {
      setSaving(false);
    }
  }

  return <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8"><Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-ink hover:text-brand-700"><ArrowLeft className="size-4" /> กลับไปดูที่พัก</Link><div className="mx-auto mt-8 max-w-3xl"><div className="mb-9 flex items-center justify-between">{steps.map((label, index) => <div key={label} className="flex items-center gap-2"><span className={index <= step ? "grid size-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white" : "grid size-8 place-items-center rounded-full border bg-white text-xs font-bold text-muted-ink"}>{index < step ? <Check className="size-4" /> : index + 1}</span><span className={index <= step ? "hidden text-xs font-bold text-brand-800 sm:inline" : "hidden text-xs text-muted-ink sm:inline"}>{label}</span>{index < steps.length - 1 && <span className="mx-1 h-px w-8 bg-border sm:w-16" />}</div>)}</div></div><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><section className="rounded-[24px] border bg-white p-5 sm:p-7">{step === 0 && <StayDetails room={room} />}{step === 1 && <GuestDetails form={form} setForm={setForm} />}{step === 2 && <ReviewDetails room={room} form={form} />}{error && <p className="mt-6 rounded-xl bg-[#fff1f0] p-3 text-xs leading-5 text-[#a33a30]">{error}</p>}{step < 2 ? <Button onClick={nextStep} className="mt-8 w-full">ดำเนินการต่อ <ChevronRight className="size-4" /></Button> : <Button onClick={submitBooking} disabled={saving} className="mt-8 w-full">{saving ? "กำลังบันทึกการจอง..." : "ยืนยันการจอง"} {!saving && <LockKeyhole className="size-4" />}</Button>}</section><aside className="h-fit rounded-[24px] border bg-white p-5 lg:sticky lg:top-6"><p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-brand-600">สรุปการจอง</p><div className="flex gap-3"><div className="size-20 shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url(${room.image})` }} /><div><h3 className="text-sm font-bold">{room.name}</h3><p className="mt-1 flex items-center gap-1 text-xs text-muted-ink"><MapPin className="size-3" /> {room.location}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#9a6b08]"><BadgeCheck className="size-3.5" /> {room.rating} คะแนน</span></div></div><div className="mt-5 space-y-3 border-y py-4 text-sm"><div className="flex items-center justify-between"><span className="flex items-center gap-2 text-muted-ink"><CalendarDays className="size-4" /> 21 - 23 ส.ค. 2569</span><span className="font-semibold">{nights} คืน</span></div><div className="flex justify-between"><span className="text-muted-ink">฿{room.price.toLocaleString("th-TH")} × {nights} คืน</span><span>฿{total.toLocaleString("th-TH")}</span></div><div className="flex justify-between"><span className="text-muted-ink">ภาษีและค่าธรรมเนียม</span><span>รวมแล้ว</span></div></div><div className="flex items-end justify-between"><span className="text-sm font-bold">ยอดรวม</span><span className="text-2xl font-black text-brand-800">฿{total.toLocaleString("th-TH")}</span></div><p className="mt-2 text-right text-[11px] text-muted-ink">ยังไม่ต้องชำระเงินตอนนี้</p></aside></div></div>;
}

function StayDetails({ room }: { room: Room }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">ขั้นตอนที่ 1</p><h1 className="mt-2 text-2xl font-black">รายละเอียดการเข้าพัก</h1><p className="mt-2 text-sm leading-6 text-muted-ink">ตรวจสอบข้อมูลห้องพักและวันที่เข้าพักของคุณก่อนดำเนินการต่อ</p><div className="mt-7 overflow-hidden rounded-2xl border"><div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${room.image})` }} /><div className="p-4"><p className="text-xs font-bold text-brand-600">{room.property}</p><h2 className="mt-1 text-lg font-black">{room.name}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-muted-ink"><MapPin className="size-3.5" /> {room.location}</p></div></div><RoomFacts room={room} /><div className="mt-7 grid gap-3 sm:grid-cols-2"><DetailBox icon={<CalendarDays />} label="วันเข้าพัก" value="ศุกร์ 21 ส.ค. 2569" /><DetailBox icon={<CalendarDays />} label="วันออกจากที่พัก" value="อาทิตย์ 23 ส.ค. 2569" /><DetailBox icon={<UserRound />} label="ผู้เข้าพัก" value={`${room.guests} ผู้เข้าพัก`} /><DetailBox icon={<CreditCard />} label="นโยบายการจอง" value="ยกเลิกฟรีก่อน 18 ส.ค." /></div><div className="mt-7"><RoomAmenities room={room} /></div><div className="mt-7 rounded-2xl bg-brand-50 p-4"><div className="flex gap-3"><ShieldCheck className="size-5 shrink-0 text-brand-600" /><div><p className="text-sm font-bold text-brand-900">จองอย่างสบายใจ</p><p className="mt-1 text-xs leading-5 text-brand-800/70">ระบบจะแสดงราคาสุทธิที่รวมภาษีและค่าธรรมเนียมแล้ว คุณยังสามารถตรวจสอบข้อมูลได้อีกครั้งก่อนยืนยัน</p></div></div></div></div>;
}

function GuestDetails({ form, setForm }: { form: { name: string; email: string; phone: string; note: string }; setForm: (form: { name: string; email: string; phone: string; note: string }) => void }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">ขั้นตอนที่ 2</p><h1 className="mt-2 text-2xl font-black">ข้อมูลผู้เข้าพัก</h1><p className="mt-2 text-sm leading-6 text-muted-ink">ข้อมูลนี้ใช้สำหรับยืนยันการจองและติดต่อคุณเท่านั้น</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><Field icon={<UserRound />} label="ชื่อ - นามสกุล" value={form.name} placeholder="เช่น ศตายุ เสริฐศรี" onChange={(value) => setForm({ ...form, name: value })} /><Field icon={<Mail />} label="อีเมล" type="email" value={form.email} placeholder="you@example.com" onChange={(value) => setForm({ ...form, email: value })} /><Field icon={<Phone />} label="เบอร์โทรศัพท์" value={form.phone} placeholder="08x-xxx-xxxx" onChange={(value) => setForm({ ...form, phone: value })} /><Field icon={<CreditCard />} label="รหัสส่วนลด (ถ้ามี)" value="" placeholder="กรอกโค้ดส่วนลด" onChange={() => undefined} /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">คำขอพิเศษ <span className="font-normal text-muted-ink">(ไม่บังคับ)</span></span><textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="min-h-24 w-full resize-none rounded-xl border bg-[#fcfdfc] px-3 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100" placeholder="เช่น ขอห้องชั้นสูง หรือเตียงเสริม" /></label></div></div>;
}

function ReviewDetails({ room, form }: { room: Room; form: { name: string; email: string; phone: string; note: string } }) {
  return <div><p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">ขั้นตอนที่ 3</p><h1 className="mt-2 text-2xl font-black">ตรวจสอบและยืนยัน</h1><p className="mt-2 text-sm leading-6 text-muted-ink">ข้อมูลพร้อมแล้ว กดยืนยันเพื่อสร้างรายการจองของคุณ</p><div className="mt-7 space-y-3"><div className="rounded-2xl border p-4"><p className="text-xs font-bold text-muted-ink">ผู้เข้าพัก</p><p className="mt-2 text-sm font-bold">{form.name || "ยังไม่ได้กรอกชื่อ"}</p><p className="mt-1 text-xs text-muted-ink">{form.email || "ยังไม่ได้กรอกอีเมล"} · {form.phone || "ยังไม่ได้กรอกเบอร์โทร"}</p></div><div className="rounded-2xl border p-4"><p className="text-xs font-bold text-muted-ink">ห้องพักและวันที่</p><p className="mt-2 text-sm font-bold">{room.name}</p><p className="mt-1 text-xs text-muted-ink">21 - 23 ส.ค. 2569 · 2 คืน · {room.guests} ผู้เข้าพัก</p></div></div><div className="mt-5 flex items-center gap-2 text-xs text-muted-ink"><Check className="size-4 text-brand-600" /> ฉันยอมรับเงื่อนไขการจองและนโยบายความเป็นส่วนตัว</div></div>;
}

function DetailBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="rounded-2xl border bg-[#fcfdfc] p-4"><span className="text-brand-600">{icon}</span><p className="mt-3 text-[11px] font-bold text-muted-ink">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>; }
function Field({ icon, label, type = "text", value, placeholder, onChange }: { icon: React.ReactNode; label: string; type?: string; value: string; placeholder: string; onChange: (value: string) => void }) { return <label><span className="mb-2 flex items-center gap-1.5 text-xs font-bold"><span className="text-brand-600">{icon}</span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border bg-[#fcfdfc] px-3 text-sm outline-none transition placeholder:text-muted-ink/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-100" /></label>; }

function Confirmation({ room, bookingCode, total }: { room: Room; bookingCode: string; total: number }) { return <div className="mx-auto max-w-xl px-5 py-20 text-center"><span className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-brand-700"><Check className="size-8" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">จองสำเร็จแล้ว</p><h1 className="mt-3 text-3xl font-black">ทริปมุกดาหารของคุณพร้อมแล้ว</h1><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-ink">ระบบบันทึกรายการจองของคุณแล้ว กรุณาเก็บเลขการจองนี้ไว้อ้างอิง</p><div className="mx-auto mt-7 rounded-2xl border bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-ink">หมายเลขการจอง</p><p className="mt-2 text-2xl font-black tracking-[0.12em] text-brand-800">{bookingCode}</p><div className="mt-4 border-t pt-4 text-left"><p className="text-sm font-bold">{room.name}</p><p className="mt-1 text-xs text-muted-ink">21 - 23 ส.ค. 2569 · มุกดาหาร</p><p className="mt-2 text-sm font-bold text-brand-800">ยอดรวม ฿{total.toLocaleString("th-TH")}</p></div></div><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/rooms"><Button variant="outline">ค้นหาที่พักเพิ่ม</Button></Link><Link href="/account"><Button>ไปยังรายการจองของฉัน</Button></Link></div></div>; }

function friendlyBookingError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/row-level security|permission denied/i.test(message)) return "ไม่มีสิทธิ์สร้างรายการจอง กรุณาเข้าสู่ระบบแล้วลองใหม่อีกครั้ง";
  if (/foreign key|room_id/i.test(message)) return "ไม่พบห้องพักนี้ในฐานข้อมูล กรุณากลับไปเลือกห้องใหม่";
  if (/duplicate|unique/i.test(message)) return "เลขการจองซ้ำ กรุณากดปุ่มยืนยันอีกครั้ง";
  return message || "บันทึกการจองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
}
