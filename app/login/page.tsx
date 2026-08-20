"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { roleHome } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const fullName = String(data.get("full_name") || "");

    try {
      const supabase = createClient();
      if (isSignup) {
        const result = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
        if (result.error) throw result.error;
        if (result.data.session) {
          setMessage("สมัครสำเร็จ กำลังพาไปหน้าบัญชีของคุณ...");
          router.push("/account");
          router.refresh();
        } else {
          setMessage("สมัครสำเร็จแล้ว กรุณาเปิดอีเมลและกดลิงก์ยืนยันบัญชีก่อนเข้าสู่ระบบ");
        }
      } else {
        const result = await supabase.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        const { data: userData } = await supabase.auth.getUser();
        const { data: profile } = userData.user
          ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
          : { data: null };
        const requestedNext = new URLSearchParams(window.location.search).get("next");
        const nextPath = requestedNext?.startsWith("/") ? requestedNext : null;
        const destination = nextPath || roleHome(profile?.role);
        setMessage("เข้าสู่ระบบสำเร็จ กำลังพาไปยังหน้าของคุณ...");
        router.push(destination);
        router.refresh();
      }
    } catch (error) {
      setMessage(friendlyAuthError(error));
    } finally {
      setLoading(false);
    }
  }

  return <main className="grid min-h-screen bg-[#f8faf9] lg:grid-cols-2">
    <section className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute inset-0 opacity-25" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80)", backgroundPosition: "center", backgroundSize: "cover" }} /><div className="absolute inset-0 bg-brand-900/80" /><div className="relative"><BrandMark inverse /></div><div className="relative max-w-md pb-10"><Sparkles className="mb-5 size-7 text-brand-300" /><h1 className="text-4xl font-black leading-tight">ทุกการเข้าพัก<br />เริ่มจากความรู้สึก<br /><span className="text-brand-300">ว่าเราเลือกถูกที่</span></h1><p className="mt-6 text-sm leading-7 text-white/55">LUMA ช่วยให้คุณค้นพบที่พักที่เหมาะกับการเดินทาง และช่วยให้ผู้ดูแลโรงแรมจัดการทุกวันได้ง่ายขึ้น</p></div><p className="relative text-xs text-white/30">LUMA MUKDAHAN · Hotel Reservation System</p></section>
    <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><Link href="/" className="mb-14 inline-flex items-center gap-2 text-sm font-semibold text-muted-ink hover:text-brand-700"><ArrowLeft className="size-4" /> กลับหน้าแรก</Link><div className="mb-9 lg:hidden"><BrandMark /></div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">ยินดีต้อนรับกลับ</p><h2 className="mt-2 text-3xl font-black tracking-tight">{isSignup ? "สร้างบัญชี LUMA" : "เข้าสู่ระบบของคุณ"}</h2><p className="mt-3 text-sm text-muted-ink">{isSignup ? "เริ่มต้นเป็นลูกค้า LUMA ได้ในไม่กี่ขั้นตอน" : "ระบบจะพาคุณไปยังหน้าตามสิทธิ์ของบัญชี"}</p><form onSubmit={onSubmit} className="mt-8 space-y-4">{isSignup && <label className="block"><span className="mb-2 flex items-center gap-1.5 text-xs font-bold"><UserRound className="size-3.5 text-brand-600" /> ชื่อ - นามสกุล</span><input name="full_name" type="text" required placeholder="เช่น ศตายุ เสริฐศรี" className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" /></label>}<label className="block"><span className="mb-2 flex items-center gap-1.5 text-xs font-bold"><Mail className="size-3.5 text-brand-600" /> อีเมล</span><input name="email" type="email" required placeholder="you@example.com" className="h-12 w-full rounded-xl border bg-white px-4 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" /></label><label className="block"><span className="mb-2 flex items-center gap-1.5 text-xs font-bold"><LockKeyhole className="size-3.5 text-brand-600" /> รหัสผ่าน</span><span className="relative block"><input name="password" type={showPassword ? "text" : "password"} required minLength={6} placeholder="อย่างน้อย 6 ตัวอักษร" className="h-12 w-full rounded-xl border bg-white px-4 pr-11 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3 text-muted-ink" aria-label="แสดงรหัสผ่าน">{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></span></label>{message && <p className="rounded-xl bg-brand-50 p-3 text-xs leading-5 text-brand-800">{message}</p>}{isSignup && <p className="rounded-xl bg-[#fff8e6] p-3 text-xs leading-5 text-[#7d5b15]">บัญชีที่สมัครจากหน้านี้เป็น role ลูกค้าเท่านั้น บัญชีพนักงานต้องให้ผู้ดูแลระบบกำหนดสิทธิ์</p>}<Button disabled={loading} className="h-12 w-full">{loading ? "กำลังตรวจสอบ..." : isSignup ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}</Button></form><p className="mt-6 text-center text-xs text-muted-ink">{isSignup ? "มีบัญชีอยู่แล้ว?" : "ยังไม่มีบัญชี?"} <button type="button" onClick={() => setIsSignup((value) => !value)} className="font-bold text-brand-700 hover:text-brand-900">{isSignup ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button></p><div className="mt-10 flex items-center justify-center gap-2 text-[11px] text-muted-ink"><LockKeyhole className="size-3" /> การเชื่อมต่อปลอดภัยด้วย Supabase Auth</div></div></section>
  </main>;
}

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.includes("Supabase")) return "ยังไม่ได้เชื่อมต่อ Supabase — ตั้งค่า environment variables ก่อนใช้งานจริง";
  if (/email not confirmed/i.test(message)) return "อีเมลนี้ยังไม่ได้ยืนยัน กรุณาเปิดอีเมลจาก Supabase แล้วกดลิงก์ยืนยันก่อนเข้าสู่ระบบ";
  if (/redirect.*url|redirect.*not allowed/i.test(message)) return "Redirect URL ของระบบยังไม่ได้เพิ่มใน Supabase Auth กรุณาตรวจสอบ URL Configuration";
  if (/invalid login credentials/i.test(message)) return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
  if (/user already registered/i.test(message)) return "อีเมลนี้มีบัญชีอยู่แล้ว ให้เปลี่ยนเป็นโหมดเข้าสู่ระบบ";
  if (/password should be at least/i.test(message)) return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
  return message || "เกิดข้อผิดพลาด ลองใหม่อีกครั้ง";
}
