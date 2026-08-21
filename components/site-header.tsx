import Link from "next/link";
import { ChevronDown, Globe2, Menu, UserRound } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { isStaffRole, roleHome } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader({ dark = false, transparent = false }: { dark?: boolean; transparent?: boolean }) {
  const supabase = await createClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const { data: profile } = user && supabase
    ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle()
    : { data: null };
  const profileName = profile?.full_name?.trim() || "โปรไฟล์";
  const profileInitials = profileName === "โปรไฟล์" ? "U" : profileName.slice(0, 2);
  const canManageHotel = Boolean(user && isStaffRole(profile?.role));

  return (
    <header className={transparent || dark ? "absolute inset-x-0 top-0 z-20" : "border-b bg-white/85 backdrop-blur-xl"}>
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" aria-label="LUMA Mukdahan หน้าหลัก"><BrandMark inverse={dark} /></Link>
        <nav className={dark ? "hidden items-center gap-7 text-sm font-medium text-white/75 lg:flex" : "hidden items-center gap-7 text-sm font-medium text-muted-ink lg:flex"}>
          <Link className="transition hover:text-brand-700" href="/rooms">ที่พักทั้งหมด</Link>
          <Link className="transition hover:text-brand-700" href="/#areas">สำรวจมุกดาหาร</Link>
          {canManageHotel && <Link className="transition hover:text-brand-700" href="/dashboard">จัดการโรงแรม</Link>}
          {profile?.role === "customer" && <Link className="transition hover:text-brand-700" href="/manager/apply">สมัครเป็นผู้จัดการ</Link>}
          <Link className="flex items-center gap-1 transition hover:text-brand-700" href="#">ช่วยเหลือ <ChevronDown className="size-3.5" /></Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className={dark ? "hidden text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex" : "hidden sm:inline-flex"}>
            <Globe2 className="size-4" /> THB <ChevronDown className="size-3" />
          </Button>
          {user ? (
            <Link href={roleHome(profile?.role)} aria-label={`เปิด${profileName}`}>
              <Button variant={dark ? "outline" : "secondary"} size="sm" className="max-w-[180px]">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-200 text-[10px] font-black text-brand-800">{profileInitials}</span>
                <span className="truncate">{profileName}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/login"><Button variant={dark ? "outline" : "secondary"} size="sm"><UserRound className="size-4" /> เข้าสู่ระบบ</Button></Link>
          )}
          <Button variant="ghost" size="icon" className={dark ? "text-white hover:bg-white/10 lg:hidden" : "lg:hidden"} aria-label="เปิดเมนู"><Menu className="size-5" /></Button>
        </div>
      </div>
    </header>
  );
}
