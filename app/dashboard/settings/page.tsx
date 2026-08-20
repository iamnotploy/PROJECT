import { DashboardShell } from "@/components/dashboard-shell";
import { HotelSettingsManagement, type HotelSettingsForm } from "@/components/hotel-settings-management";
import { getStaffContext } from "@/lib/dashboard-context";

type HotelSettingsRecord = { hotel_name: string; address: string | null; phone: string | null; contact_email: string | null; check_in_time: string; check_out_time: string; cancellation_policy: string | null; amenities: string[] };

function timeInputValue(value: string | null | undefined, fallback: string) { return (value || fallback).slice(0, 5); }

export default async function DashboardSettingsPage() {
  const context = await getStaffContext(["manager"]);
  const { data } = context.supabase ? await context.supabase.from("hotel_settings").select("hotel_name, address, phone, contact_email, check_in_time, check_out_time, cancellation_policy, amenities").eq("id", 1).maybeSingle() : { data: null };
  const settings = data as HotelSettingsRecord | null;
  const initialSettings: HotelSettingsForm = { hotelName: settings?.hotel_name || "LUMA Mukdahan", address: settings?.address || "", phone: settings?.phone || "", contactEmail: settings?.contact_email || "", checkInTime: timeInputValue(settings?.check_in_time, "14:00"), checkOutTime: timeInputValue(settings?.check_out_time, "12:00"), cancellationPolicy: settings?.cancellation_policy || "", amenities: settings?.amenities || [] };

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><HotelSettingsManagement initialSettings={initialSettings} /></DashboardShell></main>;
}
