import { DashboardShell } from "@/components/dashboard-shell";
import { HotelManagement, type HotelManagementRow } from "@/components/hotel-management";
import { getStaffContext } from "@/lib/dashboard-context";

type HotelRecord = { id: string; name: string; address: string | null; phone: string | null; contact_email: string | null; check_in_time: string; check_out_time: string; cancellation_policy: string | null; amenities: string[] | null };
type LegacyHotelRecord = { hotel_name: string; address: string | null; phone: string | null; contact_email: string | null; check_in_time: string; check_out_time: string; cancellation_policy: string | null; amenities: string[] | null };

function timeInputValue(value: string | null | undefined, fallback: string) { return (value || fallback).slice(0, 5); }

export default async function DashboardSettingsPage() {
  const context = await getStaffContext(["manager"]);
  const hotelResult = context.supabase ? await context.supabase.from("hotels").select("id, name, address, phone, contact_email, check_in_time, check_out_time, cancellation_policy, amenities").eq("owner_id", context.user?.id ?? "").order("created_at") : { data: [], error: null };
  let initialHotels: HotelManagementRow[] = ((hotelResult.data ?? []) as unknown as HotelRecord[]).map((hotel) => ({ id: hotel.id, name: hotel.name, address: hotel.address || "", phone: hotel.phone || "", contactEmail: hotel.contact_email || "", checkInTime: timeInputValue(hotel.check_in_time, "14:00"), checkOutTime: timeInputValue(hotel.check_out_time, "12:00"), cancellationPolicy: hotel.cancellation_policy || "", amenities: hotel.amenities || [], source: "hotels" }));
  if (!initialHotels.length && context.supabase && hotelResult.error) {
    const { data: legacyData } = await context.supabase.from("hotel_settings").select("hotel_name, address, phone, contact_email, check_in_time, check_out_time, cancellation_policy, amenities").eq("id", 1).maybeSingle();
    const legacy = legacyData as LegacyHotelRecord | null;
    if (legacy) initialHotels = [{ id: "legacy", name: legacy.hotel_name, address: legacy.address || "", phone: legacy.phone || "", contactEmail: legacy.contact_email || "", checkInTime: timeInputValue(legacy.check_in_time, "14:00"), checkOutTime: timeInputValue(legacy.check_out_time, "12:00"), cancellationPolicy: legacy.cancellation_policy || "", amenities: legacy.amenities || [], source: "legacy" }];
  }

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><HotelManagement initialHotels={initialHotels} /></DashboardShell></main>;
}
