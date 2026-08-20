import { DashboardShell } from "@/components/dashboard-shell";
import { FrontDeskBoard, type FrontDeskRow } from "@/components/front-desk-board";
import { getStaffContext } from "@/lib/dashboard-context";

type BookingRecord = { id: string; booking_code: string; guest_name: string; guest_phone: string | null; room_id: string; check_in: string; check_out: string; status: string; payment_status: string; rooms: { room_number: string; room_types: { name: string } | null } | null };

export default async function DashboardFrontDeskPage() {
  const context = await getStaffContext(["receptionist", "manager"]);
  const result = context.supabase ? await context.supabase.from("bookings").select("id, booking_code, guest_name, guest_phone, room_id, check_in, check_out, status, payment_status, rooms(room_number, room_types(name))").order("check_in", { ascending: true }).limit(200) : { data: [] };
  const rows: FrontDeskRow[] = ((result.data ?? []) as unknown as BookingRecord[]).map((booking) => ({ id: booking.id, bookingCode: booking.booking_code, guestName: booking.guest_name, guestPhone: booking.guest_phone ?? "", roomId: booking.room_id, roomNumber: booking.rooms?.room_number ?? "-", roomName: booking.rooms?.room_types?.name ?? "ห้องพัก", checkIn: booking.check_in, checkOut: booking.check_out, status: booking.status, paymentStatus: booking.payment_status ?? "unpaid" }));

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><FrontDeskBoard initialRows={rows} /></DashboardShell></main>;
}
