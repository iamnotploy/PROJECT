import { DashboardShell } from "@/components/dashboard-shell";
import { AdminUserManagement, type AdminUserRow } from "@/components/admin-user-management";
import { getStaffContext } from "@/lib/dashboard-context";
import type { AppRole } from "@/lib/auth";

type ProfileRecord = { id: string; full_name: string | null; email: string | null; phone: string | null; role: AppRole; created_at: string };

export default async function DashboardUsersPage() {
  const context = await getStaffContext(["admin"]);
  const { data } = context.supabase ? await context.supabase.from("profiles").select("id, full_name, email, phone, role, created_at").order("created_at", { ascending: false }) : { data: [] };
  const rows: AdminUserRow[] = ((data ?? []) as ProfileRecord[]).map((profile) => ({ id: profile.id, name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "", role: profile.role, createdAt: new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(profile.created_at)) }));

  return <main className="min-h-screen bg-[#f5f8f7]"><DashboardShell profile={context.profile} shellMeta={context.shellMeta}><AdminUserManagement initialRows={rows} currentUserId={context.user?.id ?? ""} /></DashboardShell></main>;
}
