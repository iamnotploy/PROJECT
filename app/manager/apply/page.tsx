import { redirect } from "next/navigation";
import { ManagerApplicationForm, type ManagerRequestRow } from "@/components/manager-application-form";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";

export default async function ManagerApplyPage() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?next=/manager/apply");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/manager/apply");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role && profile.role !== "customer") redirect("/dashboard");
  const { data } = await supabase.from("manager_requests").select("id, hotel_name, address, phone, contact_email, note, status, review_note, created_at").eq("applicant_id", user.id).order("created_at", { ascending: false });
  const requests: ManagerRequestRow[] = ((data ?? []) as { id: string; hotel_name: string; address: string; phone: string | null; contact_email: string | null; note: string | null; status: string; review_note: string | null; created_at: string }[]).map((row) => ({ id: row.id, hotelName: row.hotel_name, address: row.address, phone: row.phone ?? "", contactEmail: row.contact_email ?? "", note: row.note ?? "", status: row.status, reviewNote: row.review_note ?? "", createdAt: row.created_at }));
  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><ManagerApplicationForm initialRequests={requests} /></main>;
}
