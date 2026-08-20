import { redirect } from "next/navigation";
import { AdminDashboard, type AdminDashboardData } from "@/components/admin-dashboard";
import { DashboardShell } from "@/components/dashboard-shell";
import { isStaffRole, type AppRole } from "@/lib/auth";
import { type DashboardBooking, type DashboardData, type DashboardStat } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

type LiveBookingRecord = {
  booking_code: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number | string;
  created_at: string;
  rooms: {
    room_number: string;
    room_types: { name: string } | { name: string }[] | null;
  } | null;
};

type RevenueRecord = { total_price: number | string; status: string; created_at: string };
type RoomRecord = { status: string };
type ReviewRecord = { rating: number | string };

const bookingStatusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยันแล้ว",
  checked_in: "เข้าพักแล้ว",
  checked_out: "เช็กเอาต์แล้ว",
  cancelled: "ยกเลิก",
};

function formatBookingDates(checkIn: string, checkOut: string) {
  const formatter = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" });
  return `${formatter.format(new Date(checkIn))} – ${formatter.format(new Date(checkOut))}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell /></main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  if (!profile || !isStaffRole(profile.role)) redirect("/account");
  if (profile.role === "receptionist") redirect("/dashboard/front-desk");

  if (profile.role === "admin") {
    const { data: profileRows } = await supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false }).limit(500);
    const adminProfiles = (profileRows ?? []) as { id: string; full_name: string | null; email: string | null; role: AppRole; created_at: string }[];
    const adminData: AdminDashboardData = {
      totalUsers: adminProfiles.length,
      customerCount: adminProfiles.filter((item) => item.role === "customer").length,
      staffCount: adminProfiles.filter((item) => item.role === "receptionist" || item.role === "manager").length,
      adminCount: adminProfiles.filter((item) => item.role === "admin").length,
      recentUsers: adminProfiles.slice(0, 5).map((item) => ({ id: item.id, name: item.full_name || "ยังไม่ระบุชื่อ", email: item.email || "", role: item.role, createdAt: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(item.created_at)) })),
    };
    return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={{ fullName: profile.full_name || user.email || "ผู้ดูแลระบบ", role: "admin" }} data={{ bookingBadge: 0, todayLabel: new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date()), stats: [], bookings: [], revenue: [], roomSummary: { available: 0, total: 0 } }}><AdminDashboard data={adminData} /></DashboardShell></main>;
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

  const [
    { data: recentBookings },
    { data: monthBookings },
    { count: newBookingCount },
    { data: revenueRows },
    { data: roomRows },
    { data: reviewRows },
  ] = await Promise.all([
    supabase.from("bookings").select("booking_code, guest_name, check_in, check_out, status, total_price, created_at, rooms(room_number, room_types(name))").order("created_at", { ascending: false }).limit(8),
    supabase.from("bookings").select("total_price, status").gte("created_at", monthStart).neq("status", "cancelled"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo).neq("status", "cancelled"),
    supabase.from("bookings").select("total_price, status, created_at").gte("created_at", twelveMonthsAgo).neq("status", "cancelled"),
    supabase.from("rooms").select("status"),
    supabase.from("reviews").select("rating").eq("status", "published"),
  ]);

  const liveBookings = (recentBookings ?? []) as unknown as LiveBookingRecord[];
  const bookings: DashboardBooking[] = liveBookings.map((booking) => {
    const roomType = Array.isArray(booking.rooms?.room_types) ? booking.rooms?.room_types[0] : booking.rooms?.room_types;
    return {
      id: booking.booking_code,
      guest: booking.guest_name,
      room: roomType?.name ?? `ห้อง ${booking.rooms?.room_number ?? "-"}`,
      dates: formatBookingDates(booking.check_in, booking.check_out),
      amount: Number(booking.total_price),
      status: bookingStatusLabels[booking.status] ?? booking.status,
    };
  });

  const currentRevenue = (monthBookings ?? []).reduce((sum, booking) => sum + Number(booking.total_price), 0);
  const revenueFormatter = new Intl.DateTimeFormat("th-TH", { month: "short" });
  const todayLabel = new Intl.DateTimeFormat("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" }).format(now);
  const revenue = Array.from({ length: 12 }, (_, index) => {
    const month = new Date(now.getFullYear(), now.getMonth() - 11 + index, 1);
    const key = monthKey(month);
    const amount = ((revenueRows ?? []) as unknown as RevenueRecord[]).reduce((sum, booking) => {
      const createdAt = new Date(booking.created_at);
      return monthKey(createdAt) === key ? sum + Number(booking.total_price) : sum;
    }, 0);
    return { label: revenueFormatter.format(month), amount };
  });

  const rooms = (roomRows ?? []) as unknown as RoomRecord[];
  const availableRooms = rooms.filter((room) => room.status === "available").length;
  const totalRooms = rooms.length;
  const ratings = ((reviewRows ?? []) as unknown as ReviewRecord[]).map((review) => Number(review.rating)).filter((rating) => rating > 0);
  const averageRating = ratings.length ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : "ยังไม่มี";

  const stats: DashboardStat[] = [
    { label: "รายได้เดือนนี้", value: `฿${currentRevenue.toLocaleString("th-TH")}`, change: "ข้อมูลจริง", caption: "จากการจองที่ยังไม่ยกเลิก", accent: "brand" },
    { label: "อัตราการเข้าพัก", value: `${totalRooms ? Math.round(((totalRooms - availableRooms) / totalRooms) * 1000) / 10 : 0}%`, change: "ตามสถานะห้อง", caption: `จากห้องทั้งหมด ${totalRooms} ห้อง`, accent: "gold" },
    { label: "การจองใหม่", value: `${newBookingCount ?? 0}`, change: "30 วันล่าสุด", caption: "ข้อมูลจาก Supabase", accent: "coral" },
    { label: "คะแนนรีวิวเฉลี่ย", value: `${averageRating} / 5`, change: `${ratings.length} รีวิว`, caption: "รีวิวที่เผยแพร่", accent: "purple" },
  ];

  const data: DashboardData = { stats, bookings, revenue, bookingBadge: newBookingCount ?? 0, todayLabel, roomSummary: { available: availableRooms, total: totalRooms } };

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={{ fullName: profile.full_name || user.email || "ทีมงาน LUMA", role: profile.role as AppRole }} data={data} /></main>;
}
