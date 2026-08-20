import { DashboardShell } from "@/components/dashboard-shell";
import { BookingManagement, type BookingManagementRow } from "@/components/booking-management";
import { getStaffContext } from "@/lib/dashboard-context";

type BookingRecord = {
  id: string;
  booking_code: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  room_id: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
  total_price: number | string;
  guest_count: number;
  created_at: string;
  rooms: { room_number: string; room_types: { name: string } | { name: string }[] | null } | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" }).format(new Date(value));
}

export default async function DashboardBookingsPage() {
  const context = await getStaffContext(["receptionist", "manager"]);
  const records = context.supabase ? await context.supabase.from("bookings").select("id, booking_code, guest_name, guest_email, guest_phone, room_id, check_in, check_out, status, payment_status, total_price, guest_count, created_at, rooms(room_number, room_types(name))").order("created_at", { ascending: false }).limit(100) : { data: [] };
  const rows = ((records.data ?? []) as unknown as BookingRecord[]).map((record): BookingManagementRow => {
    const roomType = Array.isArray(record.rooms?.room_types) ? record.rooms?.room_types[0] : record.rooms?.room_types;
    return {
      id: record.id,
      bookingCode: record.booking_code,
      guestName: record.guest_name,
      guestEmail: record.guest_email,
      guestPhone: record.guest_phone ?? "",
      roomId: record.room_id,
      roomName: roomType?.name ?? "ไม่ระบุประเภทห้อง",
      roomNumber: record.rooms?.room_number ?? "-",
      dates: `${formatDate(record.check_in)} – ${formatDate(record.check_out)}`,
      status: record.status,
      paymentStatus: record.payment_status ?? "unpaid",
      totalPrice: Number(record.total_price),
      guestCount: record.guest_count,
      createdAt: formatDateTime(record.created_at),
    };
  });

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><BookingManagement initialRows={rows} /></DashboardShell></main>;
}
