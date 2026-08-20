import Link from "next/link";
import { ArrowUpRight, Heart, MapPin, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Room } from "@/lib/data";

export function RoomCard({ room, compact = false }: { room: Room; compact?: boolean }) {
  return (
    <article className={compact ? "group grid overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(27,66,58,0.1)] sm:grid-cols-[170px_1fr]" : "group overflow-hidden rounded-[22px] border bg-white transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(27,66,58,0.12)]"}>
      <div className={compact ? "relative min-h-44 overflow-hidden" : "relative aspect-[1.42] overflow-hidden"} style={{ backgroundImage: `url(${room.image})`, backgroundPosition: "center", backgroundSize: "cover" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e2b27]/45 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          {room.featured && <Badge className="bg-white/90 text-brand-800 shadow-sm">แนะนำโดย LUMA</Badge>}
        </div>
        <button type="button" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/85 text-muted-ink shadow-sm transition hover:bg-white hover:text-coral-500" aria-label={`บันทึก ${room.name}`}><Heart className="size-4" /></button>
        {!compact && <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white"><MapPin className="size-3.5" />{room.location}</div>}
      </div>
      <div className={compact ? "flex min-w-0 flex-col p-4" : "p-4.5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 truncate text-[11px] font-bold uppercase tracking-[0.11em] text-brand-600">{room.property}</p>
            <h3 className="truncate text-base font-bold text-ink">{room.name}</h3>
          </div>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-[#fff7df] px-2 py-1 text-xs font-bold text-[#9b6a08]"><Star className="size-3.5 fill-current" /> {room.reviews > 0 ? room.rating : "ใหม่"}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-ink"><span>{room.size}</span><span>{room.beds}</span><span className="flex items-center gap-1"><Users className="size-3" /> {room.guests} คน</span></div>
        <div className="mt-3 flex flex-wrap gap-1.5">{room.tags.map((tag) => <Badge key={tag} variant="outline" className="px-2 py-0.5 text-[10px]">{tag}</Badge>)}</div>
        <div className="mt-4 flex items-end justify-between gap-3 border-t pt-3">
          <div><span className="text-lg font-black text-ink">฿{room.price.toLocaleString("th-TH")}</span><span className="text-xs text-muted-ink"> / คืน</span><p className="text-[10px] text-muted-ink">รวมภาษีและค่าธรรมเนียมแล้ว</p></div>
          <Link href={`/rooms/${room.id}`}><Button size="sm" variant="secondary">ดูห้องพัก <ArrowUpRight className="size-3.5" /></Button></Link>
        </div>
      </div>
    </article>
  );
}
