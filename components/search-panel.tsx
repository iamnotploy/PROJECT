"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, CalendarDays, ChevronDown, Home, MapPin, Minus, Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function displayDate(value: string) {
  if (!value) return "เลือกวันที่";
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export function SearchPanel({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("2026-08-21");
  const [checkOut, setCheckOut] = useState("2026-08-23");
  const [guests, setGuests] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [guestOpen, setGuestOpen] = useState(false);
  const [stayMode, setStayMode] = useState<"overnight" | "day">("overnight");

  function submitSearch() {
    const query = new URLSearchParams({ destination: destination || "มุกดาหาร", checkIn, checkOut, guests: String(guests), rooms: String(roomCount) });
    router.push(`/rooms?${query.toString()}`);
  }

  if (compact) {
    return <CompactSearchPanel destination={destination} setDestination={setDestination} checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut} guests={guests} roomCount={roomCount} guestOpen={guestOpen} setGuestOpen={setGuestOpen} setGuests={setGuests} setRoomCount={setRoomCount} submitSearch={submitSearch} />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="overflow-visible rounded-[24px] border border-white/90 bg-white shadow-[0_24px_55px_rgba(15,54,50,0.24)]">
        <div className="hide-scrollbar flex overflow-x-auto border-b px-3 pt-2 sm:px-5">
          <button type="button" className="flex shrink-0 items-center gap-2 border-b-2 border-brand-600 px-4 py-3 text-sm font-bold text-brand-700"><Home className="size-4" /> ที่พัก</button>
          <button type="button" className="flex shrink-0 items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted-ink transition hover:text-brand-700"><BedDouble className="size-4" /> ห้องพักรายวัน</button>
          <span className="ml-auto hidden items-center px-4 text-[11px] font-semibold text-muted-ink lg:flex">ราคาสุทธิ · ยืนยันง่าย · ดูแลโดยคนในพื้นที่</span>
        </div>
        <div className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setStayMode("overnight")} className={cn("rounded-full border px-4 py-2 text-xs font-bold transition", stayMode === "overnight" ? "border-brand-600 bg-brand-50 text-brand-800" : "text-muted-ink hover:border-brand-300")}>การเข้าพักข้ามคืน</button>
            <button type="button" onClick={() => setStayMode("day")} className={cn("rounded-full border px-4 py-2 text-xs font-bold transition", stayMode === "day" ? "border-brand-600 bg-brand-50 text-brand-800" : "text-muted-ink hover:border-brand-300")}>การเข้าพักช่วงกลางวัน</button>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.35fr_1fr_1fr]">
            <DestinationField value={destination} onChange={setDestination} />
            <DateField label="เช็กอิน" value={checkIn} onChange={setCheckIn} />
            <DateField label="เช็กเอาต์" value={checkOut} onChange={setCheckOut} />
          </div>
          <div className="relative mt-3">
            <button type="button" onClick={() => setGuestOpen((value) => !value)} className="flex min-h-[72px] w-full items-center gap-3 rounded-2xl border bg-white px-4 text-left transition hover:border-brand-300 hover:bg-brand-50/60" aria-expanded={guestOpen}>
              <Users className="size-5 shrink-0 text-brand-600" />
              <span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">ผู้เข้าพักและห้องพัก</span><span className="text-sm font-bold">ผู้เข้าพัก {guests} คน · {roomCount} ห้อง</span></span>
              <ChevronDown className={cn("size-4 text-muted-ink transition", guestOpen && "rotate-180")} />
            </button>
            {guestOpen && <GuestPopover guests={guests} roomCount={roomCount} setGuests={setGuests} setRoomCount={setRoomCount} onDone={() => setGuestOpen(false)} />}
          </div>
          <div className="mt-4 flex flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-muted-ink"><input type="checkbox" className="size-4 accent-brand-600" /> แสดงที่พักแบบบ้านพักและอพาร์ตเมนต์เท่านั้น</label>
            <button type="button" className="flex items-center gap-2 font-bold text-brand-700 hover:text-brand-900"><span className="text-lg leading-none">＋</span> เพิ่มตัวเลือกการค้นหา</button>
          </div>
          <Button onClick={submitSearch} size="lg" className="mx-auto mt-5 flex w-full max-w-[320px] rounded-full"><Search className="size-4" /> ค้นหาที่พัก</Button>
        </div>
      </div>
      <p className="mt-3 text-center text-xs font-medium text-white/80">ค้นหาที่พักที่ใช่ในมุกดาหารได้ในไม่กี่วินาที</p>
    </div>
  );
}

function DestinationField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="flex min-h-[72px] cursor-text items-center gap-3 rounded-2xl border bg-white px-4 transition hover:border-brand-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"><MapPin className="size-5 shrink-0 text-brand-600" /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">จุดหมายปลายทาง</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:font-medium placeholder:text-muted-ink" placeholder="เมืองหรือชื่อโรงแรม" aria-label="จุดหมายปลายทาง" /></span></label>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="flex min-h-[72px] cursor-pointer items-center gap-3 rounded-2xl border bg-white px-4 transition hover:border-brand-300 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100"><CalendarDays className="size-5 shrink-0 text-brand-600" /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">{label}</span><input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-transparent text-sm font-bold text-ink outline-none" aria-label={`วัน${label}`} /></span></label>;
}

function CompactSearchPanel({ destination, setDestination, checkIn, setCheckIn, checkOut, setCheckOut, guests, roomCount, guestOpen, setGuestOpen, setGuests, setRoomCount, submitSearch }: { destination: string; setDestination: (value: string) => void; checkIn: string; setCheckIn: (value: string) => void; checkOut: string; setCheckOut: (value: string) => void; guests: number; roomCount: number; guestOpen: boolean; setGuestOpen: (value: boolean) => void; setGuests: (value: number) => void; setRoomCount: (value: number) => void; submitSearch: () => void }) {
  return <div className="rounded-[24px] border border-white/80 bg-white p-2 shadow-[0_20px_50px_rgba(13,64,61,0.16)]"><div className="grid gap-1 lg:grid-cols-[1.35fr_1fr_1fr_1.05fr_auto]"><label className="group flex min-h-[68px] cursor-text items-center gap-3 rounded-2xl px-4 transition hover:bg-brand-50"><MapPin className="size-5 shrink-0 text-brand-600" /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">จุดหมายปลายทาง</span><input value={destination} onChange={(event) => setDestination(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none placeholder:text-muted-ink" placeholder="เมืองหรือโรงแรม" aria-label="จุดหมายปลายทาง" /></span></label><label className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-2xl px-4 transition hover:bg-brand-50"><CalendarDays className="size-5 shrink-0 text-brand-600" /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">เช็กอิน</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none" aria-label="วันเช็กอิน" /></span></label><label className="group flex min-h-[68px] cursor-pointer items-center gap-3 rounded-2xl px-4 transition hover:bg-brand-50"><CalendarDays className="size-5 shrink-0 text-brand-600" /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">เช็กเอาต์</span><input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} className="w-full bg-transparent text-sm font-semibold text-ink outline-none" aria-label="วันเช็กเอาต์" /></span></label><div className="relative flex min-h-[68px] items-center"><button type="button" onClick={() => setGuestOpen(!guestOpen)} className="flex w-full items-center gap-3 rounded-2xl px-4 text-left transition hover:bg-brand-50" aria-expanded={guestOpen}><Users className="size-5 shrink-0 text-brand-600" /><span className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[11px] font-bold uppercase tracking-wider text-muted-ink">ผู้เข้าพัก</span><span className="truncate text-sm font-semibold">{guests} ผู้เข้าพัก · {roomCount} ห้อง</span></span><ChevronDown className={cn("size-4 text-muted-ink transition", guestOpen && "rotate-180")} /></button>{guestOpen && <GuestPopover guests={guests} roomCount={roomCount} setGuests={setGuests} setRoomCount={setRoomCount} onDone={() => setGuestOpen(false)} />}</div><Button onClick={submitSearch} size="lg" className="m-1 min-h-[60px] rounded-2xl"><Search className="size-5" /><span className="lg:hidden xl:inline">ค้นหาที่พัก</span></Button></div><div className="flex flex-wrap items-center gap-x-5 gap-y-1 px-4 pb-2 pt-1 text-[11px] text-muted-ink"><span>เช็กอิน {displayDate(checkIn)}</span><span>เช็กเอาต์ {displayDate(checkOut)}</span></div></div>;
}

function GuestPopover({ guests, roomCount, setGuests, setRoomCount, onDone }: { guests: number; roomCount: number; setGuests: (value: number) => void; setRoomCount: (value: number) => void; onDone: () => void }) {
  return <div className="absolute left-0 right-0 top-[82px] z-30 rounded-2xl border bg-white p-4 shadow-[0_18px_40px_rgba(27,66,58,0.18)] sm:left-auto sm:w-72"><Counter label="ผู้เข้าพัก" value={guests} min={1} onChange={setGuests} /><Counter label="ห้องพัก" value={roomCount} min={1} onChange={setRoomCount} /><button type="button" onClick={onDone} className="mt-3 w-full rounded-xl bg-brand-50 py-2 text-xs font-bold text-brand-800">เสร็จสิ้น</button></div>;
}

function Counter({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (value: number) => void }) {
  return <div className="flex items-center justify-between border-b py-3 last:border-b-0"><span className="text-sm font-medium">{label}</span><span className="flex items-center gap-3"><button type="button" onClick={() => onChange(Math.max(min, value - 1))} className="grid size-7 place-items-center rounded-full border text-muted-ink transition hover:border-brand-300 hover:text-brand-700" aria-label={`ลด${label}`}><Minus className="size-3" /></button><span className="w-4 text-center text-sm font-bold">{value}</span><button type="button" onClick={() => onChange(value + 1)} className="grid size-7 place-items-center rounded-full border text-muted-ink transition hover:border-brand-300 hover:text-brand-700" aria-label={`เพิ่ม${label}`}><Plus className="size-3" /></button></span></div>;
}
