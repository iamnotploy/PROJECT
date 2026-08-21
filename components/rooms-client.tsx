"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Filter, Grid2X2, List, Map, SlidersHorizontal, Star, X } from "lucide-react";
import { RoomCard } from "@/components/room-card";
import { SearchPanel } from "@/components/search-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/data";
import type { Hotel } from "@/lib/rooms";

export type RoomSearchParams = {
  hotelId?: string;
  destination?: string;
  area?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
  roomCount?: string;
};

function displayDate(value?: string) {
  if (!value) return "เลือกวันที่";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export function RoomsClient({ hotels, rooms, searchParams }: { hotels: Hotel[]; rooms: Room[]; searchParams?: RoomSearchParams }) {
  const [sort, setSort] = useState("แนะนำ");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileFilter, setMobileFilter] = useState(false);
  const selectedHotel = hotels.find((hotel) => hotel.id === searchParams?.hotelId);
  const locationQuery = (searchParams?.area || (searchParams?.destination && searchParams.destination !== "มุกดาหาร" ? searchParams.destination : ""))?.trim().toLowerCase() || "";
  const queryEntries = Object.entries({ hotel: searchParams?.hotelId, destination: searchParams?.destination, area: searchParams?.area, checkIn: searchParams?.checkIn, checkOut: searchParams?.checkOut, guests: searchParams?.guests, rooms: searchParams?.roomCount }).filter((entry) => Boolean(entry[1])) as [string, string][];
  const bookingQuery = new URLSearchParams(queryEntries).toString();
  const filteredRooms = useMemo(() => rooms.filter((room) => {
    const searchable = `${room.name} ${room.property} ${room.location}`.toLowerCase();
    return Boolean(selectedHotel) && room.price <= maxPrice && room.rating >= minRating && (!locationQuery || searchable.includes(locationQuery));
  }).sort((a, b) => sort === "ราคาต่ำสุด" ? a.price - b.price : sort === "คะแนนสูงสุด" ? b.rating - a.rating : Number(Boolean(b.featured)) - Number(Boolean(a.featured))), [rooms, maxPrice, minRating, sort, locationQuery, selectedHotel]);
  const checkInLabel = displayDate(searchParams?.checkIn || "2026-08-21");
  const checkOutLabel = displayDate(searchParams?.checkOut || "2026-08-23");
  const guestLabel = Number(searchParams?.guests || 2);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">ค้นพบที่พัก</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight">{selectedHotel ? `ห้องพักใน ${selectedHotel.name}` : "เลือกโรงแรมที่ต้องการเข้าพัก"}</h1>
            <p className="mt-2 text-sm text-muted-ink">{selectedHotel ? `${checkInLabel} – ${checkOutLabel} · ผู้เข้าพัก ${guestLabel} คน · พบ ` : "เลือกโรงแรมก่อน แล้วระบบจะแสดงเฉพาะห้องที่ว่างของโรงแรมนั้น"}<strong className="text-ink">{selectedHotel ? `${filteredRooms.length} ห้อง` : ""}</strong></p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setMobileFilter(true)}><SlidersHorizontal className="size-4" /> ตัวกรอง</Button>
            <div className="hidden items-center gap-1 rounded-xl border bg-white p-1 sm:flex">
              <button type="button" onClick={() => setView("grid")} className={view === "grid" ? "grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700" : "grid size-8 place-items-center rounded-lg text-muted-ink"}><Grid2X2 className="size-4" /></button>
              <button type="button" onClick={() => setView("list")} className={view === "list" ? "grid size-8 place-items-center rounded-lg bg-brand-100 text-brand-700" : "grid size-8 place-items-center rounded-lg text-muted-ink"}><List className="size-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <HotelPicker hotels={hotels} selectedHotelId={searchParams?.hotelId} query={bookingQuery} />
      <SearchPanel compact initialValues={{ hotelId: searchParams?.hotelId, destination: searchParams?.destination, checkIn: searchParams?.checkIn, checkOut: searchParams?.checkOut, guests: searchParams?.guests, rooms: searchParams?.roomCount }} />

      <div className="mt-8 grid gap-7 lg:grid-cols-[240px_1fr]">
        <aside className={mobileFilter ? "fixed inset-y-0 left-0 z-50 w-[min(88vw,340px)] overflow-y-auto bg-white p-5 shadow-2xl lg:static lg:block lg:w-auto lg:bg-transparent lg:p-0 lg:shadow-none" : "hidden lg:block"}>
          {mobileFilter && <div className="mb-5 flex items-center justify-between lg:hidden"><strong>ตัวกรอง</strong><button type="button" onClick={() => setMobileFilter(false)}><X className="size-5" /></button></div>}
          <FilterContent maxPrice={maxPrice} setMaxPrice={setMaxPrice} minRating={minRating} setMinRating={setMinRating} />
          <Button className="mt-5 w-full lg:hidden" onClick={() => setMobileFilter(false)}>แสดง {filteredRooms.length} ที่พัก</Button>
        </aside>
        {mobileFilter && <button type="button" aria-label="ปิดตัวกรอง" onClick={() => setMobileFilter(false)} className="fixed inset-0 z-40 bg-brand-900/25 lg:hidden" />}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-ink">แสดง <strong className="text-ink">{filteredRooms.length}</strong> ห้องที่พร้อมจอง</p>
            <label className="flex items-center gap-2 text-sm text-muted-ink">เรียงตาม <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border bg-white px-3 py-2 text-xs font-bold text-ink outline-none"><option>แนะนำ</option><option>ราคาต่ำสุด</option><option>คะแนนสูงสุด</option></select></label>
          </div>
          <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
            {filteredRooms.map((room) => <RoomCard key={room.id} room={room} compact={view === "list"} hrefQuery={bookingQuery} />)}
          </div>
          {filteredRooms.length === 0 && <div className="rounded-2xl border border-dashed bg-white p-12 text-center"><p className="font-bold">{selectedHotel ? "ยังไม่พบห้องว่างตามวันที่เลือก" : "กรุณาเลือกโรงแรมก่อน"}</p><p className="mt-1 text-sm text-muted-ink">{selectedHotel ? "ห้องที่มีการจองทับช่วงวันดังกล่าวจะไม่แสดงให้เลือก" : "เลือกโรงแรมจากด้านบนเพื่อดูรายการห้องพัก"}</p></div>}
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-brand-900"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-brand-600"><Map className="size-5" /></span><span className="flex-1 text-sm"><strong className="block">อยากเห็นที่พักบนแผนที่ไหม?</strong><span className="text-xs text-brand-700/70">ค้นหาที่พักใกล้สถานที่ที่คุณอยากไปในมุกดาหาร</span></span><Button variant="outline" size="sm">เปิดแผนที่</Button></div>
        </section>
      </div>
    </div>
  );
}

function HotelPicker({ hotels, selectedHotelId, query }: { hotels: Hotel[]; selectedHotelId?: string; query: string }) {
  return <section className="mb-6 rounded-2xl border bg-white p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">ขั้นตอนที่ 1</p><h2 className="mt-1 text-lg font-black">เลือกโรงแรม</h2></div><span className="text-xs text-muted-ink">{hotels.length} แห่ง</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{hotels.map((hotel) => <Link key={hotel.id} href={`/rooms?hotel=${hotel.id}${query ? `&${query.replace(/^hotel=[^&]+&?/, "")}` : ""}`} className={`rounded-xl border p-4 transition hover:-translate-y-0.5 hover:border-brand-400 hover:bg-brand-50 ${selectedHotelId === hotel.id ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : ""}`}><p className="text-sm font-black">{hotel.name}</p><p className="mt-1 text-xs leading-5 text-muted-ink">{hotel.address}</p><span className="mt-3 inline-flex text-[11px] font-bold text-brand-700">{selectedHotelId === hotel.id ? "กำลังเลือกโรงแรมนี้" : "ดูห้องพักของโรงแรมนี้ →"}</span></Link>)}</div></section>;
}

function FilterContent({ maxPrice, setMaxPrice, minRating, setMinRating }: { maxPrice: number; setMaxPrice: (value: number) => void; minRating: number; setMinRating: (value: number) => void }) {
  return <div className="space-y-7 rounded-2xl border bg-white p-4"><div className="flex items-center justify-between"><h2 className="text-sm font-bold">ตัวกรอง</h2><Filter className="size-4 text-muted-ink" /></div><div><p className="mb-3 text-xs font-bold text-ink">ช่วงราคา / คืน</p><input type="range" min="1000" max="5000" step="100" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} className="w-full accent-[#168875]" /><div className="mt-2 flex justify-between text-[11px] text-muted-ink"><span>฿1,000</span><strong className="text-brand-700">ถึง ฿{maxPrice.toLocaleString("th-TH")}</strong></div></div><div><p className="mb-3 text-xs font-bold text-ink">คะแนนรีวิว</p><div className="flex flex-wrap gap-1.5">{[0, 4, 4.5, 4.7].map((rating) => <button type="button" key={rating} onClick={() => setMinRating(rating)} className={minRating === rating ? "flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-2 text-xs font-bold text-white" : "flex items-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-bold text-muted-ink hover:border-brand-300"}>{rating === 0 ? "ทั้งหมด" : <><Star className="size-3 fill-current text-gold-500" /> {rating}+</>}</button>)}</div></div><div><p className="mb-3 text-xs font-bold text-ink">ประเภทที่พัก</p><div className="space-y-2.5 text-xs text-muted-ink"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-brand-600" /> โรงแรม</label><label className="flex items-center gap-2"><input type="checkbox" className="accent-brand-600" /> รีสอร์ต</label><label className="flex items-center gap-2"><input type="checkbox" className="accent-brand-600" /> บ้านพัก</label></div></div><Badge variant="outline" className="w-fit">แสดงราคาสุทธิแล้ว</Badge></div>;
}
