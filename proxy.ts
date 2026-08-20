import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { isStaffRole, roleHome } from "@/lib/auth";

function noStoreResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Vary", "Cookie");
  return response;
}

function noStoreRedirect(url: URL) {
  return noStoreResponse(NextResponse.redirect(url));
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/account");

  if (isProtectedPath) noStoreResponse(response);

  if (user && pathname === "/login") {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    return NextResponse.redirect(new URL(roleHome(profile?.role), request.url));
  }

  if (isProtectedPath) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return noStoreRedirect(loginUrl);
    }

    if (pathname.startsWith("/dashboard")) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!profile || !isStaffRole(profile.role)) {
        const accountUrl = request.nextUrl.clone();
        accountUrl.pathname = "/account";
        accountUrl.search = "";
        return noStoreRedirect(accountUrl);
      }
    }
  }

  return isProtectedPath ? noStoreResponse(response) : response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
