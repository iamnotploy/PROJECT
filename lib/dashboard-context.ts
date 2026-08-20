import { redirect } from "next/navigation";
import { isStaffRole, type AppRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function getStaffContext(allowedRoles?: Exclude<AppRole, "customer">[]) {
  const supabase = await createClient();
  const now = new Date();
  const todayLabel = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(now);

  if (!supabase) {
    return {
      supabase: null,
      user: null,
      profile: { fullName: "ทีมงาน LUMA", role: "manager" as Exclude<AppRole, "customer"> },
      shellMeta: { bookingBadge: 0, todayLabel },
    };
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();
  if (!profile || !isStaffRole(profile.role)) redirect("/account");
  if (allowedRoles && !allowedRoles.includes(profile.role)) redirect(profile.role === "receptionist" ? "/dashboard/front-desk" : "/dashboard");

  const [{ count: bookingBadge }, { data: roomRows }] = await Promise.all([
    supabase.from("bookings").select("id", { count: "exact", head: true }).gte("created_at", new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()).neq("status", "cancelled"),
    supabase.from("rooms").select("status"),
  ]);

  return {
    supabase,
    user,
    profile: { fullName: profile.full_name || user.email || "ทีมงาน LUMA", role: profile.role },
    shellMeta: { bookingBadge: bookingBadge ?? 0, todayLabel },
    roomRows: (roomRows ?? []) as { status: string }[],
  };
}
