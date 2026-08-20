import Link from "next/link";
import { ArrowLeft, ArrowRight, Bath, BedDouble, Car, CheckCircle2, Coffee, Dumbbell, MapPin, Maximize2, ShieldCheck, Sparkles, Star, Trees, Tv, Users, Utensils, Waves, Wifi, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Room } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const amenityIconRules: Array<{ match: string[]; icon: LucideIcon }> = [
  { match: ["wi-fi", "wifi", "อินเทอร์เน็ต"], icon: Wifi },
  { match: ["อาหาร", "breakfast"], icon: Coffee },
  { match: ["ที่จอด", "parking"], icon: Car },
  { match: ["สระ", "pool"], icon: Waves },
  { match: ["ฟิตเนส", "fitness"], icon: Dumbbell },
  { match: ["อ่าง", "bath"], icon: Bath },
  { match: ["สวน", "garden"], icon: Trees },
  { match: ["ทีวี", "tv"], icon: Tv },
  { match: ["ครัว", "kitchen"], icon: Utensils },
  { match: ["แอร์", "เครื่องปรับอากาศ", "air"], icon: Wind },
];

export function RoomDetail({ room }: { room: Room }) {
  const description = room.description || "ห้องพักออกแบบอย่างอบอุ่น พร้อมพื้นที่ใช้งานที่ลงตัวสำหรับการพักผ่อน";

  return <main className="min-h-screen bg-[#f8faf9] pb-16"><div className="mx-auto max-w-7xl px-5 pt-7 lg:px-8"><Link href="/rooms" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-ink transition hover:text-brand-700"><ArrowLeft className="size-4" /> กลับไปดูที่พักทั้งหมด</Link><div className="relative mt-6 aspect-[16/7] min-h-64 overflow-hidden rounded-[28px] bg-brand-900"><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${room.image})` }} /><div className="absolute inset-0 bg-gradient-to-t from-brand-900/85 via-brand-900/15 to-transparent" /><div className="absolute bottom-6 left-6 right-6 flex flex-col justify-between gap-5 text-white sm:flex-row sm:items-end lg:bottom-8 lg:left-8 lg:right-8"><div><div className="mb-3 flex flex-wrap gap-2"><Badge className="border-0 bg-white/90 text-brand-800">{room.property}</Badge>{room.featured && <Badge className="border-0 bg-[#fff1c7] text-[#8b6410]">แนะนำโดย LUMA</Badge>}</div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">{room.name}</h1><p className="mt-2 flex items-center gap-1.5 text-sm text-white/75"><MapPin className="size-4" /> {room.location}</p></div><div className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><Star className="size-5 fill-[#f6c667] text-[#f6c667]" /><span className="font-black">{room.rating > 0 ? room.rating : "ใหม่"}</span><span className="text-xs text-white/70">{room.reviews ? `${room.reviews} รีวิว` : "ห้องพักใหม่"}</span></div></div></div><div className="mt-7 grid gap-7 lg:grid-cols-[1fr_360px]"><article className="space-y-7"><section className="rounded-[24px] border bg-white p-5 sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">รายละเอียดห้องพัก</p><h2 className="mt-2 text-2xl font-black tracking-tight">พักสบายในแบบที่เป็นคุณ</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-muted-ink">{description}</p><RoomFacts room={room} /></section><RoomAmenities room={room} /><section className="rounded-[24px] border border-brand-200 bg-brand-50 p-5 sm:p-6"><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" /><div><h2 className="text-sm font-black text-brand-900">จองอย่างมั่นใจ</h2><p className="mt-1 text-xs leading-6 text-brand-800/75">ราคาที่แสดงรวมภาษีและค่าธรรมเนียมแล้ว สามารถตรวจสอบรายละเอียดทั้งหมดอีกครั้งก่อนยืนยันการจอง</p></div></div></section></article><aside className="h-fit lg:sticky lg:top-24"><div className="rounded-[24px] border bg-white p-5 shadow-[0_16px_40px_rgba(27,66,58,0.08)]"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">เริ่มต้นการเข้าพัก</p><div className="mt-4 flex items-end justify-between border-b pb-5"><div><span className="text-3xl font-black text-brand-800">฿{room.price.toLocaleString("th-TH")}</span><span className="ml-1 text-xs text-muted-ink">/ คืน</span></div><span className="flex items-center gap-1 text-xs font-bold text-[#9a6b08]"><Star className="size-3.5 fill-current" /> {room.rating > 0 ? room.rating : "ใหม่"}</span></div><div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-[#f8faf9] p-3"><span className="block text-muted-ink">ผู้เข้าพักสูงสุด</span><strong className="mt-1 block">{room.guests} คน</strong></div><div className="rounded-xl bg-[#f8faf9] p-3"><span className="block text-muted-ink">ขนาดห้อง</span><strong className="mt-1 block">{room.size}</strong></div></div><Link href={`/booking?room=${room.id}`} className="mt-5 block"><Button size="lg" className="w-full">เลือกห้องนี้ <ArrowRight className="size-4" /></Button></Link><p className="mt-3 text-center text-[11px] text-muted-ink">ยังไม่ต้องชำระเงินตอนนี้</p></div><div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-muted-ink"><CheckCircle2 className="size-3.5 text-brand-600" /> ยืนยันข้อมูลก่อนสร้างรายการจอง</div></aside></div></div></main>;
}

export function RoomFacts({ room }: { room: Room }) {
  const facts = [
    { icon: BedDouble, label: "ที่นอน", value: room.beds },
    { icon: Bath, label: "ห้องน้ำ", value: `${room.bathrooms ?? 1} ห้อง` },
    { icon: Maximize2, label: "ขนาดห้อง", value: room.size },
    { icon: Users, label: "ผู้เข้าพัก", value: `${room.guests} คน` },
  ];

  return <div className="mt-7 grid gap-3 sm:grid-cols-2">{facts.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-3 rounded-2xl border bg-[#fcfdfc] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><Icon className="size-5" strokeWidth={1.8} /></span><span className="min-w-0"><span className="block text-[11px] font-bold text-muted-ink">{label}</span><strong className="mt-1 block truncate text-sm">{value}</strong></span></div>)}</div>;
}

export function RoomAmenities({ room }: { room: Room }) {
  const amenities = room.amenities.length ? room.amenities : ["Wi-Fi ฟรี", "ที่จอดรถ"];

  return <section className="rounded-[24px] border bg-white p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">สิ่งอำนวยความสะดวก</p><h2 className="mt-2 text-xl font-black">ทุกอย่างที่เตรียมไว้ให้คุณ</h2></div><Sparkles className="size-5 text-brand-500" /></div><div className="mt-6 grid gap-3 sm:grid-cols-2">{amenities.map((amenity) => { const Icon = iconForAmenity(amenity); return <div key={amenity} className="flex items-center gap-3 rounded-2xl border border-transparent bg-[#f8faf9] p-3.5 transition hover:border-brand-200 hover:bg-brand-50"><span className="grid size-9 place-items-center rounded-xl bg-white text-brand-600 shadow-sm"><Icon className="size-4" strokeWidth={1.8} /></span><span className="text-sm font-semibold">{amenity}</span></div>; })}</div></section>;
}

function iconForAmenity(label: string) {
  const normalized = label.toLowerCase();
  return amenityIconRules.find(({ match }) => match.some((term) => normalized.includes(term)))?.icon ?? Sparkles;
}
