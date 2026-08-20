export type AppRole = "customer" | "receptionist" | "manager" | "admin";

export const staffRoles: AppRole[] = ["receptionist", "manager", "admin"];

export const roleLabels: Record<AppRole, string> = {
  customer: "ลูกค้า",
  receptionist: "พนักงานต้อนรับ",
  manager: "ผู้จัดการ",
  admin: "ผู้ดูแลระบบ",
};

export function isStaffRole(role: string | null | undefined): role is Exclude<AppRole, "customer"> {
  return role === "receptionist" || role === "manager" || role === "admin";
}

export function roleHome(role: string | null | undefined) {
  return isStaffRole(role) ? "/dashboard" : "/account";
}
