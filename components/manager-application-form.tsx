"use client";

import { useState, type FormEvent } from "react";
import { Building2, Check, Mail, MapPin, Phone, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type ManagerRequestRow = {
  id: string;
  hotelName: string;
  address: string;
  phone: string;
  contactEmail: string;
  note: string;
  status: string;
  reviewNote: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = { pending: "รอ Admin พิจารณา", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" };

export function ManagerApplicationForm({ initialRequests }: { initialRequests: ManagerRequestRow[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [form, setForm] = useState({ hotelName: "", address: "", phone: "", contactEmail: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const { data: userData } = await createClient().auth.getUser();
    if (!userData.user) {
      setError("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่");
      setBusy(false);
      return;
    }

    const { data, error: insertError } = await createClient().from("manager_requests").insert({
      applicant_id: userData.user.id,
      hotel_name: form.hotelName.trim(),
      address: form.address.trim(),
      phone: form.phone.trim() || null,
      contact_email: form.contactEmail.trim() || userData.user.email || null,
      note: form.note.trim() || null,
    }).select("id, hotel_name, address, phone, contact_email, note, status, review_note, created_at").single();

    if (insertError) setError(insertError.message);
    else if (data) {
      setRequests((current) => [{ id: data.id, hotelName: data.hotel_name, address: data.address, phone: data.phone ?? "", contactEmail: data.contact_email ?? "", note: data.note ?? "", status: data.status, reviewNote: data.review_note ?? "", createdAt: data.created_at }, ...current]);
      setForm({ hotelName: "", address: "", phone: "", contactEmail: "", note: "" });
      setMessage("ส่งคำขอเป็นผู้จัดการโรงแรมแล้ว รอ Admin พิจารณา");
    }
    setBusy(false);
  }

  return <section className="mx-auto max-w-5xl px-5 py-10 lg:px-8"><div className="mb-8"><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-bold text-[#9a6b08]"><Building2 className="size-3" /> HOTEL PARTNER PROGRAM</div><h1 className="text-3xl font-black tracking-tight">ยื่นขอสิทธิ์ผู้จัดการโรงแรม</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-muted-ink">กรอกข้อมูลโรงแรมของคุณเพื่อให้ Admin ตรวจสอบ เมื่ออนุมัติแล้วคุณจะได้รับสิทธิ์จัดการโรงแรม ห้องพัก และงานเช็กอิน-เช็กเอาต์</p></div>{message && <div className="mb-5 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800"><Check className="size-4" />{message}</div>}{error && <div className="mb-5 rounded-xl border border-coral-200 bg-coral-50 px-4 py-3 text-sm text-coral-700">{error}</div>}<div className="grid gap-6 lg:grid-cols-[1fr_360px]"><form onSubmit={submit} className="rounded-2xl border bg-white p-5 sm:p-7"><h2 className="text-lg font-black">ข้อมูลโรงแรม</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field icon={<Building2 />} label="ชื่อโรงแรม" value={form.hotelName} required placeholder="เช่น LUMA Riverside Hotel" onChange={(value) => setForm({ ...form, hotelName: value })} /><Field icon={<MapPin />} label="ที่อยู่โรงแรม" value={form.address} required placeholder="ที่อยู่สำหรับแสดงบนเว็บไซต์" onChange={(value) => setForm({ ...form, address: value })} /><Field icon={<Phone />} label="เบอร์โทรศัพท์ (ไม่บังคับ)" type="tel" inputMode="numeric" value={form.phone} placeholder="กรอกเฉพาะตัวเลข" onChange={(value) => setForm({ ...form, phone: value.replace(/\D/g, "").slice(0, 10) })} /><Field icon={<Mail />} label="อีเมลติดต่อ (ไม่บังคับ)" type="email" value={form.contactEmail} placeholder="hotel@example.com" onChange={(value) => setForm({ ...form, contactEmail: value })} /><label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold">รายละเอียดเพิ่มเติม (ไม่บังคับ)</span><textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} rows={5} placeholder="แนะนำโรงแรม จำนวนห้อง หรือข้อมูลที่ช่วยให้ Admin ตรวจสอบได้" className="w-full resize-none rounded-xl border px-3 py-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" /></label></div><Button type="submit" disabled={busy} className="mt-5 w-full sm:w-auto"><Send className="size-4" />{busy ? "กำลังส่งคำขอ..." : "ส่งคำขอให้ Admin"}</Button></form><aside className="h-fit rounded-2xl bg-brand-900 p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-300">ขั้นตอนการสมัคร</p><ol className="mt-5 space-y-5 text-sm"><li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-400 font-black text-brand-900">1</span><span>กรอกข้อมูลโรงแรมและส่งคำขอ</span></li><li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-400 font-black text-brand-900">2</span><span>Admin ตรวจสอบข้อมูล</span></li><li className="flex gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-400 font-black text-brand-900">3</span><span>เมื่ออนุมัติ บัญชีจะเปลี่ยนเป็น Manager และมีโรงแรมใน Dashboard</span></li></ol></aside></div><section className="mt-8 rounded-2xl border bg-white p-5 sm:p-7"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black">ประวัติคำขอของฉัน</h2><p className="mt-1 text-sm text-muted-ink">ตรวจสอบสถานะการสมัครเป็นผู้จัดการโรงแรม</p></div><span className="rounded-full border px-3 py-1 text-xs font-bold">{requests.length} รายการ</span></div>{requests.length ? <div className="mt-5 space-y-3">{requests.map((request) => <div key={request.id} className="rounded-xl border p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-black">{request.hotelName}</p><p className="mt-1 text-xs text-muted-ink">{request.address}</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${request.status === "approved" ? "bg-brand-100 text-brand-800" : request.status === "rejected" ? "bg-coral-50 text-coral-700" : "bg-[#fff4d8] text-[#8b6410]"}`}>{statusLabels[request.status] ?? request.status}</span></div>{request.reviewNote && <p className="mt-3 rounded-lg bg-[#fbfcfb] p-3 text-xs text-muted-ink">หมายเหตุจาก Admin: {request.reviewNote}</p>}</div>)}</div> : <p className="mt-5 rounded-xl border border-dashed p-8 text-center text-sm text-muted-ink">ยังไม่มีคำขอ</p>}</section></section>;
}

function Field({ icon, label, value, placeholder, onChange, type = "text", inputMode, required = false }: { icon: React.ReactNode; label: string; value: string; placeholder: string; onChange: (value: string) => void; type?: string; inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"]; required?: boolean }) {
  return <label><span className="mb-2 flex items-center gap-1.5 text-xs font-bold"><span className="text-brand-600">{icon}</span>{label}</span><input required={required} type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border bg-[#fcfdfc] px-3 text-sm outline-none transition placeholder:text-muted-ink/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-100" /></label>;
}
