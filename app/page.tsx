import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { RoomCard } from "@/components/room-card";
import { SearchPanel } from "@/components/search-panel";
import { SiteHeader } from "@/components/site-header";
import { popularAreas } from "@/lib/data";
import { getRooms } from "@/lib/rooms";

export default async function HomePage() {
  const rooms = await getRooms();

  return (
    <main>
      <SiteHeader />
      <section className="relative overflow-visible bg-brand-900">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2400&q=90)" }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,45,46,0.84),rgba(9,80,73,0.48),rgba(7,45,46,0.22))]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/20 via-transparent to-brand-900/30" />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-20 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="mx-auto max-w-3xl text-center text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-xs font-bold backdrop-blur"><Sparkles className="size-3.5 text-gold-400" /> พักให้เต็มที่ในเมืองริมโขง</div>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">ค้นพบที่พักที่ทำให้<br /><span className="text-brand-200">มุกดาหารเป็นบ้าน</span></h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">จองห้องพักที่ใช่สำหรับการเดินทางครั้งต่อไป พร้อมข้อมูลที่ชัดเจน ราคาที่เห็นจริง และประสบการณ์แบบท้องถิ่น</p>
          </div>
          <div className="relative z-10 mt-9 -mb-20"><SearchPanel /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-14 pt-32 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">คัดสรรมาให้คุณ</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">ที่พักน่าเช็กอินในมุกดาหาร</h2></div><Link href="/rooms" className="hidden items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-900 sm:flex">ดูทั้งหมด <ArrowRight className="size-4" /></Link></div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{rooms.slice(0, 3).map((room) => <RoomCard key={room.id} room={room} />)}</div>
        <Link href="/rooms" className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-brand-700 sm:hidden">ดูที่พักทั้งหมด <ArrowRight className="size-4" /></Link>
      </section>

      <section id="areas" className="border-y bg-white"><div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">สำรวจด้วยจังหวะของคุณ</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">มุมโปรดของคนมาเยือนมุกดาหาร</h2></div><div className="grid gap-4 md:grid-cols-3">{popularAreas.map((area) => <Link href={`/rooms?area=${encodeURIComponent(area.name)}`} key={area.name} className="group relative aspect-[1.35] overflow-hidden rounded-2xl"><div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${area.image})` }} /><div className="absolute inset-0 bg-gradient-to-t from-[#0c2924]/80 via-transparent to-transparent" /><div className="absolute bottom-5 left-5 text-white"><h3 className="text-xl font-bold">{area.name}</h3><p className="mt-1 text-xs text-white/70">{area.count}</p></div><span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:bg-white group-hover:text-brand-700"><ArrowRight className="size-4" /></span></Link>)}</div></div></section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="grid gap-5 md:grid-cols-3"><ValueCard icon={<ShieldCheck />} title="ราคาชัดเจนตั้งแต่แรก" copy="เห็นราคาที่รวมค่าธรรมเนียมแล้ว ไม่มีค่าใช้จ่ายแอบแฝงตอนจ่ายเงิน" /><ValueCard icon={<HeartHandshake />} title="ดูแลโดยคนในพื้นที่" copy="ทีม LUMA พร้อมช่วยตั้งแต่ก่อนเดินทาง จนกว่าจะเช็กเอาต์กลับบ้าน" /><ValueCard icon={<BadgeCheck />} title="ข้อมูลที่ไว้ใจได้" copy="รายละเอียดห้องพักและรีวิวจากผู้เข้าพักจริง เพื่อให้คุณเลือกได้อย่างมั่นใจ" /></div></section>

      <footer className="bg-brand-900 text-white"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-12 lg:flex-row lg:items-end lg:justify-between lg:px-8"><div><BrandMark inverse /><p className="mt-4 max-w-sm text-sm leading-7 text-white/55">ระบบจัดการจองห้องพักโรงแรมออนไลน์ในจังหวัดมุกดาหาร<br />ต้นแบบเพื่อการเรียนรู้และการต่อยอดธุรกิจที่พักท้องถิ่น</p></div><div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/65"><Link href="/rooms" className="hover:text-white">ค้นหาที่พัก</Link><Link href="/login" className="hover:text-white">เข้าสู่ระบบ</Link><span className="text-white/35">© 2026 LUMA Mukdahan</span></div></div></footer>
    </main>
  );
}

function ValueCard({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return <div className="rounded-2xl border bg-white p-5"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span><h3 className="mt-4 text-base font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-ink">{copy}</p></div>;
}
