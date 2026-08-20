import { redirect } from "next/navigation";
import { CustomerAccount, type CustomerBooking } from "@/components/customer-account";
import { SiteHeader } from "@/components/site-header";
import { roleLabels } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><AccountEmpty /></main>;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const [{ data: profile }, { data: bookings }] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, role").eq("id", user.id).maybeSingle(),
    supabase.from("bookings").select("id, booking_code, check_in, check_out, status, total_price").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const customerBookings: CustomerBooking[] = (bookings ?? []).map((booking) => ({ id: booking.id, bookingCode: booking.booking_code, checkIn: booking.check_in, checkOut: booking.check_out, status: booking.status, totalPrice: Number(booking.total_price) }));

  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><CustomerAccount userId={user.id} name={profile?.full_name ?? ""} email={user.email ?? ""} phone={profile?.phone ?? ""} roleLabel={roleLabels[profile?.role as keyof typeof roleLabels] || "ลูกค้า"} initialBookings={customerBookings} /></main>;
}

function AccountEmpty() {
  return <div className="mx-auto max-w-lg px-5 py-20 text-center"><h1 className="text-2xl font-black">บัญชีของฉัน</h1><p className="mt-2 text-sm text-muted-ink">ตั้งค่า Supabase เพื่อเปิดใช้งานระบบบัญชี</p></div>;
}
