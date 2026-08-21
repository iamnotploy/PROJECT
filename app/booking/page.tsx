import Link from "next/link";
import { redirect } from "next/navigation";
import { BookingFlow } from "@/components/booking-flow";
import { SignOutButton } from "@/components/sign-out-button";
import { SiteHeader } from "@/components/site-header";
import { isStaffRole, roleLabels, type AppRole } from "@/lib/auth";
import { getRooms } from "@/lib/rooms";
import { createClient } from "@/lib/supabase/server";

type BookingSearchParams = { room?: string; hotel?: string; checkIn?: string; checkOut?: string; guests?: string };

export default async function BookingPage({ searchParams }: { searchParams: Promise<BookingSearchParams> }) {
  const params = await searchParams;
  if (!params.hotel) redirect("/rooms");
  const supabase = await createClient();
  const bookingQueryEntries = Object.entries(params).filter((entry) => Boolean(entry[1])) as [string, string][];
  const bookingQuery = new URLSearchParams(bookingQueryEntries).toString();
  const nextPath = `/booking${bookingQuery ? `?${bookingQuery}` : ""}`;

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = user ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle() : { data: null };
    const role = profile?.role as AppRole | undefined;
    if (!user || role !== "customer") {
      return <BookingAccessGate role={role} nextPath={nextPath} />;
    }
  }

  const rooms = await getRooms({ hotelId: params.hotel, checkIn: params.checkIn, checkOut: params.checkOut, guests: Number(params.guests || 1) });
  const room = rooms.find((item) => item.id === params.room) ?? rooms[0];
  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><BookingFlow room={room} stay={{ checkIn: params.checkIn, checkOut: params.checkOut, guests: params.guests }} /></main>;
}

function BookingAccessGate({ role, nextPath }: { role?: AppRole; nextPath: string }) {
  const staffAccount = Boolean(role && isStaffRole(role));
  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><section className="mx-auto max-w-xl px-5 py-20 text-center"><div className="mx-auto grid size-16 place-items-center rounded-full bg-brand-100 text-3xl">🔐</div><p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">การจองสำหรับลูกค้า</p><h1 className="mt-3 text-3xl font-black">{staffAccount ? "บัญชีพนักงานยังจองห้องพักไม่ได้" : "เข้าสู่ระบบก่อนจองห้องพัก"}</h1><p className="mx-auto mt-4 max-w-md text-sm leading-7 text-muted-ink">{staffAccount ? `บัญชีนี้เป็น${roleLabels[role as AppRole]} ใช้สำหรับดูแลงานโรงแรม หากต้องการจองห้องพัก กรุณาออกจากระบบแล้วใช้บัญชีลูกค้าแยกต่างหาก` : "กรุณาเข้าสู่ระบบด้วยบัญชีลูกค้าเพื่อให้รายการจองถูกบันทึกไว้ในบัญชีและแสดงในประวัติการจอง"}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">{staffAccount ? <><Link href="/dashboard" className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">กลับไป Dashboard</Link><SignOutButton variant="outline" /></> : <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-bold text-white">เข้าสู่ระบบลูกค้า</Link>}<Link href="/rooms" className="inline-flex h-11 items-center justify-center rounded-xl border bg-white px-5 text-sm font-bold text-ink">กลับไปเลือกห้อง</Link></div></section></main>;
}
