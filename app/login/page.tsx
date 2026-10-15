import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { GoogleButton } from "./google-button";
import Link from "next/link";
import { isProfileComplete, type Profile } from "@/lib/profile";
import { safeReturnPath } from "@/lib/return-path";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const returnPath = safeReturnPath(next);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("id, first_name, last_name, avatar_path").eq("id", user.id).single();
    redirect(profile && isProfileComplete(profile as Profile) ? returnPath : `/profile?next=${encodeURIComponent(returnPath)}`);
  }
  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12">
    <SiteHeader />
    <section className="mx-auto my-20 max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-800">Join the joke</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Good humor starts with you.</h1>
      <p className="mt-5 leading-7 text-stone-600">Sign in to craft humors, preview captions, vote, and join the feed. New here? Your Google account creates your Humor Lab account automatically.</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">Sign-in was not completed. Please try again using this browser.</p>}
      <GoogleButton returnPath={returnPath} />
      <p className="mt-5 text-xs leading-5 text-stone-500">We use Google for sign-in. We never ask for your Google password. <Link href="/privacy" className="text-teal-800 underline">Read our privacy information.</Link></p>
    </section>
  </main>;
}
