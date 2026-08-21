"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Building2, Check, MapPin, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type HotelManagementRow = {
  id: string;
  name: string;
  address: string;
  phone: string;
  contactEmail: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  amenities: string[];
  source?: "hotels" | "legacy";
};

export function HotelManagement({ initialHotels }: { initialHotels: HotelManagementRow[] }) {
  const [hotels, setHotels] = useState(initialHotels);
  const [selectedId, setSelectedId] = useState(initialHotels[0]?.id ?? "");
  const selected = useMemo(() => hotels.find((hotel) => hotel.id === selectedId) ?? hotels[0], [hotels, selectedId]);
  const [form, setForm] = useState(() => selected ? { ...selected, amenitiesText: selected.amenities.join("\n") } : emptyForm());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function chooseHotel(id: string) {
    const hotel = hotels.find((item) => item.id === id);
    if (!hotel) return;
    setSelectedId(id);
    setForm({ ...hotel, amenitiesText: hotel.amenities.join("\n") });
    setMessage("");
    setError("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    setBusy(true);
    setMessage("");
    setError("");
    const amenities = form.amenitiesText.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
    const payload = { name: form.name.trim(), address: form.address.trim(), phone: form.phone.trim() || null, contact_email: form.contactEmail.trim() || null, check_in_time: form.checkInTime, check_out_time: form.checkOutTime, cancellation_policy: form.cancellationPolicy.trim() || null, amenities };
    const query = selected.source === "legacy" ? createClient().from("hotel_settings").update({ hotel_name: payload.name, address: payload.address || null, phone: payload.phone, contact_email: payload.contact_email, check_in_time: payload.check_in_time, check_out_time: payload.check_out_time, cancellation_policy: payload.cancellation_policy, amenities }).eq("id", 1) : createClient().from("hotels").update(payload).eq("id", selected.id);
    const { error: updateError } = await query;
    if (updateError) setError(updateError.message);
    else {
      const next = { ...selected, name: payload.name, address: payload.address, phone: payload.phone ?? "", contactEmail: payload.contact_email ?? "", checkInTime: payload.check_in_time, checkOutTime: payload.check_out_time, cancellationPolicy: payload.cancellation_policy ?? "", amenities };
      setHotels((current) => current.map((hotel) => hotel.id === selected.id ? next : hotel));
      setForm({ ...next, amenitiesText: amenities.join("\n") });
      setMessage("บันทึกข้อมูลโรงแรมแล้ว");
    }
    setBusy(false);
  }

  if (!selected) return <section className="space-y-6"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-bold text-[#9a6b08]"><Building2 className="size-3" /> HOTEL MANAGER</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">ข้อมูลโรงแรม</h2><p className="mt-2 text-sm text-muted-ink">บัญชี Manager ยังไม่มีโรงแรมที่ได้รับอนุมัติจาก Admin</p></div><div className="rounded-2xl border border-dashed bg-white p-10 text-center"><Building2 className="mx-auto size-8 text-brand-600" /><p className="mt-3 text-sm font-bold">รอการอนุมัติโรงแรม</p><p className="mt-1 text-xs text-muted-ink">เมื่อ Admin อนุมัติคำขอ โรงแรมจะปรากฏในหน้านี้</p></div></section>;

  return <section className="space-y-6"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-bold text-[#9a6b08]"><Building2 className="size-3" /> HOTEL MANAGER</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">ข้อมูลโรงแรม</h2><p className="mt-2 text-sm text-muted-ink">จัดการชื่อ ที่อยู่ ช่องทางติดต่อ และนโยบายของโรงแรมที่คุณดูแล</p></div>{hotels.length > 1 && <div className="flex flex-wrap gap-2">{hotels.map((hotel) => <button type="button" key={hotel.id} onClick={() => chooseHotel(hotel.id)} className={`rounded-xl border px-4 py-3 text-left text-xs font-bold ${selected.id === hotel.id ? "border-brand-600 bg-brand-50 text-brand-800" : "bg-white text-muted-ink"}`}><span className="block">{hotel.name}</span><span className="mt-1 block text-[10px] font-normal">{hotel.address || "ยังไม่มีที่อยู่"}</span></button>)}</div>}{message && <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"><Check className="size-4" />{message}</div>}{error && <div className="flex items-center gap-2 rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-600"><X className="size-4" />{error}</div>}<form onSubmit={save} className="rounded-2xl border bg-white p-5 sm:p-7"><div className="mb-6 flex items-start gap-3 rounded-xl bg-brand-50 p-4"><MapPin className="mt-0.5 size-5 shrink-0 text-brand-600" /><div><p className="text-sm font-bold text-brand-900">{selected.name}</p><p className="mt-1 text-xs leading-5 text-brand-800/70">ข้อมูลนี้จะแสดงให้ลูกค้าเห็นก่อนเลือกห้องพัก</p></div></div><div className="grid gap-5 sm:grid-cols-2"><Field label="ชื่อโรงแรม" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required /><Field label="เบอร์โทรศัพท์ (ไม่บังคับ)" type="tel" inputMode="numeric" value={form.phone} onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 10) })} /><Field label="อีเมลติดต่อ (ไม่บังคับ)" type="email" value={form.contactEmail} onChange={(value) => setForm({ ...form, contactEmail: value })} /><Field label="ที่อยู่โรงแรม" value={form.address} onChange={(value) => setForm({ ...form, address: value })} required /><Field label="เวลาเช็กอิน" type="time" value={form.checkInTime} onChange={(value) => setForm({ ...form, checkInTime: value })} required /><Field label="เวลาเช็กเอาต์" type="time" value={form.checkOutTime} onChange={(value) => setForm({ ...form, checkOutTime: value })} required /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">สิ่งอำนวยความสะดวก</span><textarea value={form.amenitiesText} onChange={(event) => setForm({ ...form, amenitiesText: event.target.value })} rows={4} placeholder="Wi-Fi ฟรี\nที่จอดรถ\nแผนกต้อนรับ 24 ชม." className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-400" /><small className="font-normal text-muted-ink">ใส่ทีละรายการต่อบรรทัด หรือคั่นด้วยจุลภาค</small></label><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">นโยบายการยกเลิก</span><textarea value={form.cancellationPolicy} onChange={(event) => setForm({ ...form, cancellationPolicy: event.target.value })} rows={4} className="w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none focus:border-brand-400" /></label></div><div className="mt-6 flex justify-end"><Button type="submit" disabled={busy}><Save className="size-4" />{busy ? "กำลังบันทึก..." : "บันทึกข้อมูลโรงแรม"}</Button></div></form></section>;
}

function emptyForm() { return { id: "", name: "", address: "", phone: "", contactEmail: "", checkInTime: "14:00", checkOutTime: "12:00", cancellationPolicy: "", amenities: [], source: "hotels" as const, amenitiesText: "" }; }

function Field({ label, value, onChange, type = "text", inputMode, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; required?: boolean }) { return <label className="grid gap-1.5 text-xs font-bold text-muted-ink"><span>{label}</span><input required={required} type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 rounded-xl border px-3 text-sm font-normal text-ink outline-none focus:border-brand-400" /></label>; }
