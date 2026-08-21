"use client";

import { useState } from "react";
import { Check, ClipboardCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";

export type AdminManagerRequestRow = {
  id: string;
  applicantName: string;
  applicantEmail: string;
  hotelName: string;
  address: string;
  phone: string;
  contactEmail: string;
  note: string;
  status: string;
  createdAt: string;
};

const statusLabels: Record<string, string> = { pending: "รอตรวจสอบ", approved: "อนุมัติแล้ว", rejected: "ไม่อนุมัติ" };

export function ManagerRequestManagement({ initialRows }: { initialRows: AdminManagerRequestRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function review(row: AdminManagerRequestRow, decision: "approved" | "rejected") {
    const reviewNote = window.prompt(decision === "approved" ? "หมายเหตุการอนุมัติ (ไม่บังคับ)" : "เหตุผลที่ไม่อนุมัติ (ไม่บังคับ)", "") ?? "";
    setBusyId(row.id);
    setMessage("");
    const { error } = await createClient().rpc("admin_review_manager_request", { p_request_id: row.id, p_decision: decision, p_review_note: reviewNote });
    if (error) setMessage(error.message);
    else {
      setRows((current) => current.map((item) => item.id === row.id ? { ...item, status: decision } : item));
      setMessage(decision === "approved" ? `อนุมัติ ${row.hotelName} แล้ว บัญชี ${row.applicantName} เป็น Manager` : `บันทึกว่าไม่อนุมัติ ${row.hotelName} แล้ว`);
    }
    setBusyId(null);
  }

  return <section className="mt-8 space-y-5"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#fff4d8] px-2.5 py-1 text-[10px] font-bold text-[#8b6410]"><ClipboardCheck className="size-3" /> MANAGER APPLICATIONS</div><h2 className="text-2xl font-black tracking-tight">คำขอเป็นผู้จัดการโรงแรม</h2><p className="mt-2 text-sm text-muted-ink">ตรวจสอบข้อมูลโรงแรมก่อนอนุมัติสิทธิ์ Manager ให้กับลูกค้า</p></div>{message && <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">{message}</div>}<div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead><tr className="border-b bg-[#fbfcfb] text-[10px] font-bold uppercase tracking-wider text-muted-ink"><th className="px-5 py-3">ผู้ยื่นคำขอ</th><th className="px-5 py-3">โรงแรม</th><th className="px-5 py-3">ติดต่อ</th><th className="px-5 py-3">สถานะ</th><th className="px-5 py-3 text-right">ดำเนินการ</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-b align-top last:border-0"><td className="px-5 py-4"><p className="text-xs font-black">{row.applicantName || "ไม่ระบุชื่อ"}</p><p className="mt-1 text-[11px] text-muted-ink">{row.applicantEmail || "ไม่มีอีเมล"}</p><p className="mt-1 text-[10px] text-muted-ink">ส่งเมื่อ {row.createdAt}</p></td><td className="px-5 py-4"><p className="text-xs font-black">{row.hotelName}</p><p className="mt-1 max-w-xs text-[11px] leading-5 text-muted-ink">{row.address}</p>{row.note && <p className="mt-2 max-w-xs rounded-lg bg-[#fbfcfb] p-2 text-[10px] text-muted-ink">{row.note}</p>}</td><td className="px-5 py-4 text-xs text-muted-ink"><p>{row.phone || "ไม่มีเบอร์โทร"}</p><p className="mt-1">{row.contactEmail || "ไม่มีอีเมลติดต่อ"}</p></td><td className="px-5 py-4"><Badge variant={row.status === "approved" ? "success" : row.status === "rejected" ? "danger" : "warning"}>{statusLabels[row.status] ?? row.status}</Badge></td><td className="px-5 py-4 text-right">{row.status === "pending" ? <div className="flex justify-end gap-2"><button type="button" disabled={busyId === row.id} onClick={() => review(row, "approved")} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><Check className="size-3.5" />อนุมัติ</button><button type="button" disabled={busyId === row.id} onClick={() => review(row, "rejected")} className="inline-flex items-center gap-1 rounded-lg border border-coral-200 px-3 py-2 text-xs font-bold text-coral-600 disabled:opacity-50"><X className="size-3.5" />ไม่อนุมัติ</button></div> : <span className="text-xs text-muted-ink">ดำเนินการแล้ว</span>}</td></tr>)}</tbody></table></div>{rows.length === 0 && <div className="px-5 py-16 text-center text-sm text-muted-ink">ยังไม่มีคำขอเป็นผู้จัดการโรงแรม</div>}</div></section>;
}
