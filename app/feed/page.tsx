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
    <section className="pb-10 pt-16">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-800">Today’s campus caption battle</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div><h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">The laugh feed.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">Fresh AI captions inspired by awkward elevators, subway logic, campus rituals, and whatever New York serves up next.</p></div>
        <Link href={user ? "/studio" : "/login"} className="rounded-full bg-teal-900 px-6 py-3 text-sm font-medium text-white hover:bg-teal-800">{user ? "Create a caption →" : "Sign in to join →"}</Link>
      </div>
    </section>
    {generations.length ? <section className="grid gap-5 md:grid-cols-2" aria-label="AI-generated captions">
      {generations.map((generation) => <GenerationCard key={generation.id} generation={generation} signedIn={Boolean(user)} />)}
    </section> : <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center"><h2 className="text-2xl font-semibold">The feed is waiting for its first joke.</h2><p className="mt-3 text-stone-600">Sign in, describe a very New York moment, and let the battle begin.</p></section>}
  </main>;
}
