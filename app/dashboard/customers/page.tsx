import { DashboardShell } from "@/components/dashboard-shell";
import { CustomerManagement, type CustomerHistoryRow, type CustomerManagementRow } from "@/components/customer-management";
import { getStaffContext } from "@/lib/dashboard-context";

type ProfileRecord = { id: string; full_name: string; email: string | null; phone: string | null; role: string; created_at: string };
type BookingRecord = { id: string; user_id: string | null; booking_code: string; guest_name: string; guest_email: string; check_in: string; check_out: string; status: string; total_price: number | string; rooms: { room_number: string; room_types: { name: string } | null } | null };

function dateOnly(value: string) { return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }).format(new Date(value)); }
function dateTime(value: string) { return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(value)); }

export default async function DashboardCustomersPage() {
  const context = await getStaffContext(["receptionist", "manager"]);
  const [profileResult, bookingResult] = context.supabase ? await Promise.all([
    context.supabase.from("profiles").select("id, full_name, email, phone, role, created_at").order("created_at", { ascending: false }),
    context.supabase.from("bookings").select("id, user_id, booking_code, guest_name, guest_email, check_in, check_out, status, total_price, rooms(room_number, room_types(name))").order("created_at", { ascending: false }).limit(300),
  ]) : [{ data: [] }, { data: [] }];

  const profiles = (profileResult.data ?? []) as unknown as ProfileRecord[];
  const bookings = (bookingResult.data ?? []) as unknown as BookingRecord[];
  const rows: CustomerManagementRow[] = profiles.map((profile) => {
    const userBookings = bookings.filter((booking) => booking.user_id === profile.id);
    return { id: profile.id, name: profile.full_name, email: profile.email ?? userBookings[0]?.guest_email ?? "", phone: profile.phone ?? "", role: profile.role, createdAt: dateTime(profile.created_at), bookingCount: userBookings.length, stayCount: userBookings.filter((booking) => booking.status === "checked_in" || booking.status === "checked_out").length, totalSpent: userBookings.filter((booking) => booking.status !== "cancelled").reduce((sum, booking) => sum + Number(booking.total_price), 0) };
  });
  const history: CustomerHistoryRow[] = bookings.map((booking) => ({ id: booking.id, userId: booking.user_id, bookingCode: booking.booking_code, room: `${booking.rooms?.room_types?.name ?? "ห้องพัก"} ${booking.rooms?.room_number ? `· ห้อง ${booking.rooms.room_number}` : ""}`, dates: `${dateOnly(booking.check_in)} – ${dateOnly(booking.check_out)}`, status: booking.status, amount: Number(booking.total_price) }));

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><CustomerManagement initialRows={rows} history={history} currentRole={context.profile.role} /></DashboardShell></main>;
}
