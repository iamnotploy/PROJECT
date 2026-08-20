"use client";

import { useState, type FormEvent } from "react";
import { Check, Save, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type HotelSettingsForm = { hotelName: string; address: string; phone: string; contactEmail: string; checkInTime: string; checkOutTime: string; cancellationPolicy: string; amenities: string[] };

export function HotelSettingsManagement({ initialSettings }: { initialSettings: HotelSettingsForm }) {
  const [form, setForm] = useState({ ...initialSettings, amenitiesText: initialSettings.amenities.join("\n") });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setError(null);
    const amenities = form.amenitiesText.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    const { error: updateError } = await createClient().from("hotel_settings").update({ hotel_name: form.hotelName.trim(), address: form.address.trim() || null, phone: form.phone.trim() || null, contact_email: form.contactEmail.trim() || null, check_in_time: form.checkInTime, check_out_time: form.checkOutTime, cancellation_policy: form.cancellationPolicy.trim() || null, amenities }).eq("id", 1);
    if (updateError) setError(updateError.message);
    else { setForm((current) => ({ ...current, amenitiesText: amenities.join("\n") })); setMessage("บันทึกการตั้งค่าโรงแรมแล้ว"); }
    setBusy(false);
  }

  return <section className="space-y-6"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-bold text-[#9a6b08]"><Settings className="size-3" /> HOTEL MANAGER</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">ตั้งค่ารายละเอียดโรงแรม</h2><p className="mt-2 text-sm text-muted-ink">ข้อมูลการให้บริการของโรงแรมอยู่ในการดูแลของผู้จัดการ และจะแสดงบนเว็บไซต์กับขั้นตอนการจอง</p></div>{message && <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"><Check className="size-4" />{message}</div>}{error && <div className="flex items-center gap-2 rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-600"><X className="size-4" />{error}</div>}<form onSubmit={save} className="rounded-2xl border bg-white p-5 sm:p-7"><div className="grid gap-5 sm:grid-cols-2"><Field label="ชื่อโรงแรม" value={form.hotelName} onChange={(value) => update("hotelName", value)} required /><Field label="เบอร์โทรศัพท์" value={form.phone} onChange={(value) => update("phone", value)} /><Field label="อีเมลติดต่อ" type="email" value={form.contactEmail} onChange={(value) => update("contactEmail", value)} /><Field label="ที่อยู่" value={form.address} onChange={(value) => update("address", value)} /><Field label="เวลาเช็กอิน" type="time" value={form.checkInTime} onChange={(value) => update("checkInTime", value)} required /><Field label="เวลาเช็กเอาต์" type="time" value={form.checkOutTime} onChange={(value) => update("checkOutTime", value)} required /><label className="grid gap-1.5 text-xs font-bold text-muted-ink sm:col-span-2"><span>สิ่งอำนวยความสะดวก</span><textarea value={form.amenitiesText} onChange={(event) => update("amenitiesText", event.target.value)} placeholder="Wi-Fi ฟรี\nที่จอดรถ\nแผนกต้อนรับ 24 ชม." rows={4} className="rounded-xl border px-3 py-2 text-sm font-normal text-ink outline-none focus:border-brand-400" /><small className="font-normal">ใส่ทีละรายการต่อบรรทัด หรือคั่นด้วยเครื่องหมายจุลภาค</small></label><label className="grid gap-1.5 text-xs font-bold text-muted-ink sm:col-span-2"><span>นโยบายการยกเลิก</span><textarea value={form.cancellationPolicy} onChange={(event) => update("cancellationPolicy", event.target.value)} rows={4} className="rounded-xl border px-3 py-2 text-sm font-normal text-ink outline-none focus:border-brand-400" /></label></div><div className="mt-6 flex justify-end"><Button type="submit" disabled={busy}><Save className="size-4" />{busy ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}</Button></div></form></section>;
}

function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="grid gap-1.5 text-xs font-bold text-muted-ink"><span>{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border px-3 text-sm font-normal text-ink outline-none focus:border-brand-400" /></label>;
}
