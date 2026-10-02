import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { GoogleButton } from "./google-button";
import Link from "next/link";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/profile");
  const { error } = await searchParams;
  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12">
    <SiteHeader />
    <section className="mx-auto my-20 max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-sm sm:p-12">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-800">Join the joke</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight">Good humor starts with you.</h1>
      <p className="mt-5 leading-7 text-stone-600">Sign in to set up your profile and explore the members’ studio. New here? Your Google account creates your Humor Lab account automatically.</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">Sign-in was not completed. Please try again using this browser.</p>}
      <GoogleButton />
      <p className="mt-5 text-xs leading-5 text-stone-500">We use Google for sign-in. We never ask for your Google password. <Link href="/privacy" className="text-teal-800 underline">Read our privacy information.</Link></p>
    </section>
  </main>;
}
