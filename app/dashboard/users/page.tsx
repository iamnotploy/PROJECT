import { DashboardShell } from "@/components/dashboard-shell";
import { AdminUserManagement, type AdminUserRow } from "@/components/admin-user-management";
import { ManagerRequestManagement, type AdminManagerRequestRow } from "@/components/manager-request-management";
import { getStaffContext } from "@/lib/dashboard-context";
import type { AppRole } from "@/lib/auth";

type ProfileRecord = { id: string; full_name: string | null; email: string | null; phone: string | null; role: AppRole; created_at: string };
type ManagerRequestRecord = { id: string; hotel_name: string; address: string; phone: string | null; contact_email: string | null; note: string | null; status: string; created_at: string; profiles: { full_name: string | null; email: string | null } | null };

export default async function DashboardUsersPage() {
  const context = await getStaffContext(["admin"]);
  const [profileResult, requestResult] = context.supabase ? await Promise.all([
    context.supabase.from("profiles").select("id, full_name, email, phone, role, created_at").order("created_at", { ascending: false }),
    context.supabase.from("manager_requests").select("id, hotel_name, address, phone, contact_email, note, status, created_at, profiles!manager_requests_applicant_id_fkey(full_name, email)").order("created_at", { ascending: false }),
  ]) : [{ data: [] }, { data: [] }];
  const rows: AdminUserRow[] = ((profileResult.data ?? []) as ProfileRecord[]).map((profile) => ({ id: profile.id, name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "", role: profile.role, createdAt: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(profile.created_at)) }));
  const requestRows: AdminManagerRequestRow[] = ((requestResult.data ?? []) as unknown as ManagerRequestRecord[]).map((request) => ({ id: request.id, applicantName: request.profiles?.full_name || "", applicantEmail: request.profiles?.email || "", hotelName: request.hotel_name, address: request.address, phone: request.phone || "", contactEmail: request.contact_email || "", note: request.note || "", status: request.status, createdAt: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(request.created_at)) }));

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><AdminUserManagement initialRows={rows} currentUserId={context.user?.id ?? ""} /><ManagerRequestManagement initialRows={requestRows} /></DashboardShell></main>;
}
