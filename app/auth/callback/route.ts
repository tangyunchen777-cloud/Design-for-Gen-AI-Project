import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isProfileComplete, type Profile } from "@/lib/profile";
import { safeReturnPath } from "@/lib/return-path";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const returnPath = safeReturnPath(request.nextUrl.searchParams.get("next"));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = user ? await supabase.from("profiles").select("id, first_name, last_name, avatar_path").eq("id", user.id).single() : { data: null };
      const destination = profile && isProfileComplete(profile as Profile)
        ? returnPath
        : `/profile?next=${encodeURIComponent(returnPath)}`;
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }
  return NextResponse.redirect(new URL(`/login?error=callback&next=${encodeURIComponent(returnPath)}`, request.url));
}
