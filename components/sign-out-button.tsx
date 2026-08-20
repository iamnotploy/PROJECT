"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton(props: ButtonProps) {
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    window.location.replace("/login");
  }

  return <Button type="button" {...props} disabled={loading || props.disabled} onClick={signOut}><LogOut className="size-4" />{loading ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}</Button>;
}
