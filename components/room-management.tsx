"use client";

import { useState } from "react";
import { BedDouble, Building2, Plus, Trash2, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export type RoomTypeManagementRow = {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxGuests: number;
  sizeSqm: number | null;
  bedDescription: string;
  bathrooms: number;
  amenities: string[];
};

export type RoomManagementRow = {
  id: string;
  roomTypeId: string;
  roomTypeName: string;
  roomNumber: string;
  floor: number | null;
  status: string;
  housekeepingStatus: string;
  lastCleanedAt: string | null;
};

const roomStatusLabels: Record<string, string> = { available: "ว่าง", occupied: "มีผู้เข้าพัก", reserved: "ถูกจอง", maintenance: "ปิดปรับปรุง" };
const housekeepingLabels: Record<string, string> = { clean: "สะอาด", dirty: "รอทำความสะอาด", inspected: "ตรวจแล้ว", out_of_order: "ใช้งานไม่ได้" };

export function RoomManagement({ initialTypes, initialRooms }: { initialTypes: RoomTypeManagementRow[]; initialRooms: RoomManagementRow[] }) {
  const [types, setTypes] = useState(initialTypes);
  const [rooms, setRooms] = useState(initialRooms);
  const [typeForm, setTypeForm] = useState({ name: "", basePrice: "", maxGuests: "2", sizeSqm: "", bedDescription: "1 เตียงคิงไซส์", bathrooms: "1", amenities: "Wi-Fi ฟรี, ที่จอดรถ", description: "" });
  const [roomForm, setRoomForm] = useState({ roomNumber: "", floor: "1", roomTypeId: initialTypes[0]?.id ?? "" });
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState({ basePrice: "", bedDescription: "", bathrooms: "1" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setMessage(null);
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้"); } finally { setBusy(false); }
  }

  async function addRoomType(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("room_types").insert({ name: typeForm.name, description: typeForm.description, base_price: Number(typeForm.basePrice), max_guests: Number(typeForm.maxGuests), size_sqm: typeForm.sizeSqm ? Number(typeForm.sizeSqm) : null, bed_description: typeForm.bedDescription, bathrooms: Number(typeForm.bathrooms), amenities: typeForm.amenities.split(",").map((item) => item.trim()).filter(Boolean) }).select("id, name, description, base_price, max_guests, size_sqm, bed_description, bathrooms, amenities").single();
      if (error) throw error;
      setTypes((current) => [...current, { id: data.id, name: data.name, description: data.description ?? "", basePrice: Number(data.base_price), maxGuests: data.max_guests, sizeSqm: data.size_sqm, bedDescription: data.bed_description, bathrooms: data.bathrooms, amenities: data.amenities ?? [] }]);
      setRoomForm((current) => ({ ...current, roomTypeId: current.roomTypeId || data.id }));
      setTypeForm({ name: "", basePrice: "", maxGuests: "2", sizeSqm: "", bedDescription: "1 เตียงคิงไซส์", bathrooms: "1", amenities: "Wi-Fi ฟรี, ที่จอดรถ", description: "" });
      setMessage("เพิ่มประเภทห้องพักแล้ว");
    });
  }

  async function addRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await runAction(async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("rooms").insert({ room_type_id: roomForm.roomTypeId, room_number: roomForm.roomNumber, floor: Number(roomForm.floor), status: "available", housekeeping_status: "clean" }).select("id, room_type_id, room_number, floor, status, housekeeping_status, last_cleaned_at").single();
      if (error) throw error;
      const type = types.find((item) => item.id === data.room_type_id);
      setRooms((current) => [...current, { id: data.id, roomTypeId: data.room_type_id, roomTypeName: type?.name ?? "", roomNumber: data.room_number, floor: data.floor, status: data.status, housekeepingStatus: data.housekeeping_status, lastCleanedAt: data.last_cleaned_at }]);
      setRoomForm((current) => ({ ...current, roomNumber: "" }));
      setMessage("เพิ่มห้องพักแล้ว");
    });
  }

  async function updateRoom(id: string, patch: { status?: string; housekeeping_status?: string }) {
    await runAction(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("rooms").update(patch).eq("id", id);
      if (error) throw error;
      setRooms((current) => current.map((room) => room.id === id ? { ...room, status: patch.status ?? room.status, housekeepingStatus: patch.housekeeping_status ?? room.housekeepingStatus } : room));
      setMessage("อัปเดตสถานะห้องแล้ว");
    });
  }

  async function updateRoomType(id: string) {
    await runAction(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("room_types").update({ base_price: Number(editingDraft.basePrice), bed_description: editingDraft.bedDescription, bathrooms: Number(editingDraft.bathrooms) }).eq("id", id);
      if (error) throw error;
      setTypes((current) => current.map((type) => type.id === id ? { ...type, basePrice: Number(editingDraft.basePrice), bedDescription: editingDraft.bedDescription, bathrooms: Number(editingDraft.bathrooms) } : type));
      setEditingType(null);
      setMessage("แก้ไขประเภทห้องแล้ว");
    });
  }

  async function deleteRoom(id: string) {
    if (!window.confirm("ต้องการลบห้องนี้หรือไม่?")) return;
    await runAction(async () => {
      const { error } = await createClient().from("rooms").delete().eq("id", id);
      if (error) throw error;
      setRooms((current) => current.filter((room) => room.id !== id));
      setMessage("ลบห้องพักแล้ว");
    });
  }

  async function deleteRoomType(id: string) {
    if (!window.confirm("ต้องการลบประเภทห้องนี้หรือไม่? ห้องที่ใช้งานประเภทนี้ต้องถูกลบหรือเปลี่ยนประเภทก่อน")) return;
    await runAction(async () => {
      const { error } = await createClient().from("room_types").delete().eq("id", id);
      if (error) throw error;
      setTypes((current) => current.filter((type) => type.id !== id));
      setMessage("ลบประเภทห้องแล้ว");
    });
  }

  return <section className="space-y-6">
    <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-[10px] font-bold text-brand-800"><BedDouble className="size-3" /> การบริหารห้องพัก</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">ห้องพักและประเภทห้อง</h2><p className="mt-2 text-sm text-muted-ink">เพิ่ม แก้ไข ลบ และปรับสถานะห้องพักให้ตรงกับการทำงานจริงของโรงแรม</p></div>
    {message && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}
    <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]"><form onSubmit={addRoomType} className="rounded-2xl border bg-white p-5"><h3 className="flex items-center gap-2 text-sm font-black"><Plus className="size-4 text-brand-600" />เพิ่มประเภทห้องพัก</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="ชื่อประเภทห้อง" value={typeForm.name} onChange={(value) => setTypeForm({ ...typeForm, name: value })} required className="sm:col-span-2" /><Field label="รายละเอียด" value={typeForm.description} onChange={(value) => setTypeForm({ ...typeForm, description: value })} className="sm:col-span-2" /><Field label="ราคาต่อคืน" type="number" value={typeForm.basePrice} onChange={(value) => setTypeForm({ ...typeForm, basePrice: value })} required /><Field label="รองรับผู้เข้าพัก" type="number" value={typeForm.maxGuests} onChange={(value) => setTypeForm({ ...typeForm, maxGuests: value })} required /><Field label="ขนาด ตร.ม." type="number" value={typeForm.sizeSqm} onChange={(value) => setTypeForm({ ...typeForm, sizeSqm: value })} /><Field label="ห้องน้ำ" type="number" value={typeForm.bathrooms} onChange={(value) => setTypeForm({ ...typeForm, bathrooms: value })} required /><Field label="เตียง" value={typeForm.bedDescription} onChange={(value) => setTypeForm({ ...typeForm, bedDescription: value })} className="sm:col-span-2" /><Field label="สิ่งอำนวยความสะดวก คั่นด้วย ," value={typeForm.amenities} onChange={(value) => setTypeForm({ ...typeForm, amenities: value })} className="sm:col-span-2" /></div><Button type="submit" className="mt-4 w-full" disabled={busy}>บันทึกประเภทห้อง</Button></form><div className="rounded-2xl border bg-white p-5"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-black"><Building2 className="size-4 text-brand-600" />ประเภทห้องที่มีอยู่</h3><Badge variant="outline">{types.length} ประเภท</Badge></div><div className="mt-4 grid gap-3">{types.map((type) => <div key={type.id} className="rounded-xl border bg-[#fbfcfb] p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{type.name}</p><p className="mt-1 text-xs text-muted-ink">฿{type.basePrice.toLocaleString("th-TH")} / คืน · {type.maxGuests} คน · {type.bathrooms} ห้องน้ำ</p></div><div className="flex gap-1"><button type="button" className="rounded-lg px-2 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100" onClick={() => { setEditingType(type.id); setEditingDraft({ basePrice: String(type.basePrice), bedDescription: type.bedDescription, bathrooms: String(type.bathrooms) }); }}>แก้ไข</button><button type="button" className="rounded-lg p-1.5 text-coral-600 hover:bg-coral-50" onClick={() => deleteRoomType(type.id)} aria-label={`ลบ ${type.name}`}><Trash2 className="size-3.5" /></button></div></div>{editingType === type.id && <div className="mt-3 grid gap-2 border-t pt-3 sm:grid-cols-3"><input aria-label="ราคาใหม่" type="number" value={editingDraft.basePrice} onChange={(event) => setEditingDraft({ ...editingDraft, basePrice: event.target.value })} className="h-9 rounded-lg border px-2 text-xs" /><input aria-label="เตียงใหม่" value={editingDraft.bedDescription} onChange={(event) => setEditingDraft({ ...editingDraft, bedDescription: event.target.value })} className="h-9 rounded-lg border px-2 text-xs" /><input aria-label="ห้องน้ำใหม่" type="number" value={editingDraft.bathrooms} onChange={(event) => setEditingDraft({ ...editingDraft, bathrooms: event.target.value })} className="h-9 rounded-lg border px-2 text-xs" /><Button type="button" size="sm" onClick={() => updateRoomType(type.id)} disabled={busy} className="sm:col-span-3">บันทึกการแก้ไข</Button></div>}<div className="mt-3 flex flex-wrap gap-1.5">{type.amenities.map((amenity) => <span key={amenity} className="rounded-full bg-white px-2 py-1 text-[10px] text-muted-ink">{amenity}</span>)}</div></div>)}</div></div></div>
    <div className="rounded-2xl border bg-white p-5"><h3 className="flex items-center gap-2 text-sm font-black"><Plus className="size-4 text-brand-600" />เพิ่มห้องพัก</h3><form onSubmit={addRoom} className="mt-4 grid gap-3 sm:grid-cols-4"><Field label="เลขห้อง" value={roomForm.roomNumber} onChange={(value) => setRoomForm({ ...roomForm, roomNumber: value })} required /><Field label="ชั้น" type="number" value={roomForm.floor} onChange={(value) => setRoomForm({ ...roomForm, floor: value })} required /><label className="grid gap-1 text-xs font-bold text-muted-ink"><span>ประเภทห้อง</span><select required value={roomForm.roomTypeId} onChange={(event) => setRoomForm({ ...roomForm, roomTypeId: event.target.value })} className="h-10 rounded-xl border bg-white px-3 text-sm font-normal text-ink outline-none focus:border-brand-400"><option value="">เลือกประเภทห้อง</option>{types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label><Button type="submit" className="self-end" disabled={busy || !types.length}><Plus className="size-4" />เพิ่มห้อง</Button></form></div>
    <div className="overflow-hidden rounded-2xl border bg-white"><div className="flex items-center justify-between border-b px-5 py-4"><div><h3 className="text-sm font-black">รายการห้องพัก</h3><p className="mt-1 text-[11px] text-muted-ink">ปรับสถานะห้องและ housekeeping จากหน้านี้</p></div><Badge variant="outline">{rooms.length} ห้อง</Badge></div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-muted-ink"><th className="px-5 py-3">ห้อง</th><th className="px-5 py-3">ประเภท</th><th className="px-5 py-3">สถานะห้อง</th><th className="px-5 py-3">Housekeeping</th><th className="px-5 py-3 text-right">จัดการ</th></tr></thead><tbody>{rooms.map((room) => <tr key={room.id} className="border-b last:border-0"><td className="px-5 py-4"><p className="text-sm font-black">{room.roomNumber}</p><p className="text-[11px] text-muted-ink">ชั้น {room.floor ?? "-"}</p></td><td className="px-5 py-4 text-xs text-muted-ink">{room.roomTypeName}</td><td className="px-5 py-4"><select value={room.status} onChange={(event) => updateRoom(room.id, { status: event.target.value })} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold outline-none focus:border-brand-400"><option value="available">ว่าง</option><option value="occupied">มีผู้เข้าพัก</option><option value="reserved">ถูกจอง</option><option value="maintenance">ปิดปรับปรุง</option></select><div className="mt-2"><Badge variant={room.status === "available" ? "success" : room.status === "maintenance" ? "danger" : "warning"}>{roomStatusLabels[room.status] ?? room.status}</Badge></div></td><td className="px-5 py-4"><select value={room.housekeepingStatus} onChange={(event) => updateRoom(room.id, { housekeeping_status: event.target.value })} className="rounded-lg border bg-white px-2 py-2 text-xs font-bold outline-none focus:border-brand-400"><option value="clean">สะอาด</option><option value="dirty">รอทำความสะอาด</option><option value="inspected">ตรวจแล้ว</option><option value="out_of_order">ใช้งานไม่ได้</option></select><p className="mt-1 text-[10px] text-muted-ink">{housekeepingLabels[room.housekeepingStatus] ?? room.housekeepingStatus}</p></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => deleteRoom(room.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-coral-600 hover:bg-coral-50"><Trash2 className="size-3.5" />ลบ</button></td></tr>)}</tbody></table></div>{rooms.length === 0 && <div className="px-5 py-16 text-center text-sm text-muted-ink"><Wrench className="mx-auto size-6" /><p className="mt-2">ยังไม่มีห้องพัก</p></div>}</div>
  </section>;
}

function Field({ label, value, onChange, type = "text", required = false, className = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean; className?: string }) {
  return <label className={`grid gap-1 text-xs font-bold text-muted-ink ${className}`}><span>{label}</span><input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="h-10 rounded-xl border bg-white px-3 text-sm font-normal text-ink outline-none focus:border-brand-400" /></label>;
}
