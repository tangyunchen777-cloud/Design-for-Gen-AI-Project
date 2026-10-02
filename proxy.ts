import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    },
  );
  const { data, error } = await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  if ((request.nextUrl.pathname === "/profile" || request.nextUrl.pathname === "/studio") && (error || !data?.claims)) {
    const login = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.getAll().forEach(cookie => login.cookies.set(cookie));
    ["Cache-Control", "Expires", "Pragma"].forEach(name => {
      const value = response.headers.get(name);
      if (value) login.headers.set(name, value);
    });
    return login;
  }
  return response;
}

export const config = { matcher: ["/", "/login", "/profile", "/studio", "/auth/:path*"] };
