import Link from "next/link";
import { connection } from "next/server";
import { GenerationCard } from "@/components/generation-card";
import { SiteHeader } from "@/components/site-header";
import { getGenerations } from "@/lib/generations";
import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  await connection();
  const supabase = await createClient();
  const [{ data: { user } }, generations] = await Promise.all([supabase.auth.getUser(), getGenerations()]);

  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12 sm:py-16">
    <SiteHeader />
    <section className="pb-10 pt-16 sm:pt-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-800">Humors · Crowd-ranked daily</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div><h1 className="text-5xl font-black tracking-tight sm:text-6xl">Funny lives here.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">Fresh AI captions from campus photos, New York observations, and minds that should probably be studying.</p></div>
        <Link href={user ? "/studio" : "/login"} className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-stone-950 shadow-[3px_3px_0_#202b29] transition hover:-translate-y-0.5">{user ? "Craft humor →" : "Sign in to craft →"}</Link>
      </div>
    </section>
    {generations.length ? <section className="grid gap-5 md:grid-cols-2" aria-label="AI-generated captions">
      {generations.map((generation) => <GenerationCard key={generation.id} generation={generation} signedIn={Boolean(user)} />)}
    </section> : <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center"><h2 className="text-2xl font-semibold">The feed is waiting for its first joke.</h2><p className="mt-3 text-stone-600">Sign in, add a very New York moment, and craft the first humor.</p></section>}
  </main>;
}
