import { BarChart3, CalendarDays, CircleDollarSign, Percent, TrendingUp } from "lucide-react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { getStaffContext } from "@/lib/dashboard-context";

type BookingReport = { status: string; total_price: number | string; created_at: string };
type RoomReport = { status: string };

const statusLabels: Record<string, string> = { pending: "รอดำเนินการ", confirmed: "ยืนยันแล้ว", checked_in: "เข้าพักแล้ว", checked_out: "เช็กเอาต์แล้ว", cancelled: "ยกเลิก" };

function monthKey(date: Date) { return `${date.getFullYear()}-${date.getMonth()}`; }

export default async function DashboardReportsPage() {
  const context = await getStaffContext(["manager"]);
  const twelveMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1).toISOString();
  const [bookingResult, roomResult] = context.supabase ? await Promise.all([
    context.supabase.from("bookings").select("status, total_price, created_at").gte("created_at", twelveMonthsAgo),
    context.supabase.from("rooms").select("status"),
  ]) : [{ data: [] }, { data: [] }];
  const bookings = (bookingResult.data ?? []) as unknown as BookingReport[];
  const rooms = (roomResult.data ?? []) as unknown as RoomReport[];
  const validBookings = bookings.filter((booking) => booking.status !== "cancelled");
  const revenue = validBookings.reduce((sum, booking) => sum + Number(booking.total_price), 0);
  const occupied = rooms.filter((room) => room.status === "occupied" || room.status === "reserved").length;
  const occupancy = rooms.length ? Math.round((occupied / rooms.length) * 1000) / 10 : 0;
  const monthFormatter = new Intl.DateTimeFormat("th-TH", { month: "short" });
  const months = Array.from({ length: 12 }, (_, index) => new Date(new Date().getFullYear(), new Date().getMonth() - 11 + index, 1));
  const monthlyRevenue = months.map((month) => ({ label: monthFormatter.format(month), amount: validBookings.filter((booking) => monthKey(new Date(booking.created_at)) === monthKey(month)).reduce((sum, booking) => sum + Number(booking.total_price), 0) }));
  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map((item) => item.amount), 1);
  const statusCounts = Object.entries(bookings.reduce<Record<string, number>>((counts, booking) => ({ ...counts, [booking.status]: (counts[booking.status] ?? 0) + 1 }), {}));

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><section className="space-y-6"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#f1edff] px-2.5 py-1 text-[10px] font-bold text-[#6a52b3]"><BarChart3 className="size-3" /> รายงานและสถิติ</div><h2 className="text-2xl font-black tracking-tight lg:text-3xl">รายงานการดำเนินงาน</h2><p className="mt-2 text-sm text-muted-ink">สรุปข้อมูลการจอง รายได้ อัตราการเข้าพัก และสถิติจากข้อมูลจริงใน Supabase</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><ReportCard icon={CircleDollarSign} label="รายได้ 12 เดือน" value={`฿${revenue.toLocaleString("th-TH")}`} tone="brand" /><ReportCard icon={Percent} label="อัตราการเข้าพักปัจจุบัน" value={`${occupancy}%`} tone="gold" /><ReportCard icon={CalendarDays} label="การจองทั้งหมด" value={bookings.length.toLocaleString("th-TH")} tone="coral" /><ReportCard icon={TrendingUp} label="ห้องที่พร้อมขาย" value={`${rooms.filter((room) => room.status === "available").length}/${rooms.length}`} tone="purple" /></div><div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]"><section className="rounded-2xl border bg-white p-5 lg:p-6"><div className="flex items-start justify-between"><div><h3 className="text-sm font-black">รายได้รายเดือน</h3><p className="mt-1 text-[11px] text-muted-ink">รวมรายการจองที่ไม่ถูกยกเลิก</p></div><Badge variant="outline">ข้อมูลจริง</Badge></div><div className="mt-8 flex h-56 items-end gap-2 border-b border-l px-3 pt-4 sm:gap-4">{monthlyRevenue.map((item, index) => <div key={`${item.label}-${index}`} className="group flex h-full flex-1 items-end" title={`${item.label}: ฿${item.amount.toLocaleString("th-TH")}`}><div className={`w-full rounded-t-md transition ${index === monthlyRevenue.length - 1 ? "bg-brand-600 group-hover:bg-brand-700" : "bg-brand-100 group-hover:bg-brand-300"}`} style={{ height: `${Math.max((item.amount / maxMonthlyRevenue) * 100, item.amount ? 4 : 0)}%` }} /></div>)}</div><div className="mt-3 flex justify-between pl-3 text-[10px] text-muted-ink">{monthlyRevenue.map((item, index) => <span key={`${item.label}-caption-${index}`}>{item.label}</span>)}</div></section><section className="rounded-2xl border bg-white p-5 lg:p-6"><h3 className="text-sm font-black">สถานะการจอง</h3><p className="mt-1 text-[11px] text-muted-ink">แบ่งตามสถานะปัจจุบัน</p><div className="mt-6 space-y-4">{statusCounts.map(([status, count]) => <div key={status}><div className="flex items-center justify-between text-xs"><span className="font-bold">{statusLabels[status] ?? status}</span><span className="text-muted-ink">{count} รายการ</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-50"><div className="h-full rounded-full bg-brand-500" style={{ width: `${bookings.length ? (count / bookings.length) * 100 : 0}%` }} /></div></div>)}{statusCounts.length === 0 && <p className="py-10 text-center text-xs text-muted-ink">ยังไม่มีข้อมูลการจอง</p>}</div></section></div><section className="rounded-2xl border bg-white p-5"><h3 className="text-sm font-black">สรุปตามช่วงเวลา</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead><tr className="border-b text-[10px] text-muted-ink"><th className="px-3 py-3">ช่วงเวลา</th><th className="px-3 py-3">จำนวนการจอง</th><th className="px-3 py-3">รายได้</th><th className="px-3 py-3">ห้องพร้อมขาย</th></tr></thead><tbody><tr className="border-b last:border-0"><td className="px-3 py-4 font-bold">12 เดือนล่าสุด</td><td className="px-3 py-4">{bookings.length.toLocaleString("th-TH")} รายการ</td><td className="px-3 py-4 font-black">฿{revenue.toLocaleString("th-TH")}</td><td className="px-3 py-4">{rooms.filter((room) => room.status === "available").length} จาก {rooms.length} ห้อง</td></tr></tbody></table></div></section></section></DashboardShell></main>;
}

function ReportCard({ icon: Icon, label, value, tone }: { icon: typeof CircleDollarSign; label: string; value: string; tone: "brand" | "gold" | "coral" | "purple" }) {
  const colors = { brand: "bg-brand-100 text-brand-700", gold: "bg-[#fff4d8] text-[#9a6b08]", coral: "bg-coral-50 text-coral-600", purple: "bg-[#f1edff] text-[#6a52b3]" };
  return <div className="rounded-2xl border bg-white p-5"><span className={`grid size-9 place-items-center rounded-xl ${colors[tone]}`}><Icon className="size-4" /></span><p className="mt-5 text-xs text-muted-ink">{label}</p><p className="mt-1 text-2xl font-black tracking-tight">{value}</p></div>;
}
