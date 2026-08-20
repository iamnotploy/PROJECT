import { DashboardShell } from "@/components/dashboard-shell";
import { RoomManagement, type RoomManagementRow, type RoomTypeManagementRow } from "@/components/room-management";
import { getStaffContext } from "@/lib/dashboard-context";

type RoomTypeRecord = { id: string; name: string; description: string | null; base_price: number | string; max_guests: number; size_sqm: number | string | null; bed_description: string; bathrooms: number; amenities: string[] | null };
type RoomRecord = { id: string; room_type_id: string; room_number: string; floor: number | null; status: string; housekeeping_status: string; last_cleaned_at: string | null; room_types: { name: string } | null };

export default async function DashboardRoomsPage() {
  const context = await getStaffContext(["manager"]);
  const [typeResult, roomResult] = context.supabase ? await Promise.all([
    context.supabase.from("room_types").select("id, name, description, base_price, max_guests, size_sqm, bed_description, bathrooms, amenities").order("name"),
    context.supabase.from("rooms").select("id, room_type_id, room_number, floor, status, housekeeping_status, last_cleaned_at, room_types(name)").order("room_number"),
  ]) : [{ data: [] }, { data: [] }];

  const types = ((typeResult.data ?? []) as unknown as RoomTypeRecord[]).map((type): RoomTypeManagementRow => ({ id: type.id, name: type.name, description: type.description ?? "", basePrice: Number(type.base_price), maxGuests: type.max_guests, sizeSqm: type.size_sqm === null ? null : Number(type.size_sqm), bedDescription: type.bed_description, bathrooms: type.bathrooms, amenities: type.amenities ?? [] }));
  const rooms = ((roomResult.data ?? []) as unknown as RoomRecord[]).map((room): RoomManagementRow => ({ id: room.id, roomTypeId: room.room_type_id, roomTypeName: room.room_types?.name ?? "ไม่ระบุประเภทห้อง", roomNumber: room.room_number, floor: room.floor, status: room.status, housekeepingStatus: room.housekeeping_status ?? "clean", lastCleanedAt: room.last_cleaned_at }));

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><RoomManagement initialTypes={types} initialRooms={rooms} /></DashboardShell></main>;
}
