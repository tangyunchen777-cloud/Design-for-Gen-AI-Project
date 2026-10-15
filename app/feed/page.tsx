import Link from "next/link";
import { connection } from "next/server";
import { GenerationCard } from "@/components/generation-card";
import { SiteHeader } from "@/components/site-header";
import { getGenerations } from "@/lib/generations";
import { createClient } from "@/lib/supabase/server";

const periods = {
  week: { label: "Past week", days: 7 },
  month: { label: "Past month", days: 30 },
  year: { label: "Past year", days: 365 },
} as const;

type Period = keyof typeof periods;

function dateBefore(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export default async function FeedPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await connection();
  const requestedPeriod = (await searchParams).period;
  const period: Period = requestedPeriod && requestedPeriod in periods ? requestedPeriod as Period : "week";
  const supabase = await createClient();
  const weeklySince = dateBefore(periods.week.days);
  const selectedSince = dateBefore(periods[period].days);
  const [{ data: { user } }, weeklyGenerations, selectedGenerations] = await Promise.all([
    supabase.auth.getUser(),
    getGenerations(250, weeklySince),
    period === "week" ? Promise.resolve(null) : getGenerations(250, selectedSince),
  ]);
  const generations = selectedGenerations ?? weeklyGenerations;
  const headline = [...weeklyGenerations].sort((a, b) =>
    b.upvotes - a.upvotes || b.score - a.score || Date.parse(b.created_at) - Date.parse(a.created_at),
  )[0] ?? null;
  const collection = generations.filter((generation) => generation.id !== headline?.id);

  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12 sm:py-16">
    <SiteHeader />
    <section className="pb-10 pt-16 sm:pt-20">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-800">Humors · The community collection</p>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6">
        <div><h1 className="text-5xl font-black tracking-tight sm:text-6xl">Funny lives here.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">Fresh AI captions from campus photos, New York observations, and minds that should probably be studying.</p></div>
        <Link href={user ? "/studio" : "/login"} className="rounded-full bg-coral px-6 py-3 text-sm font-bold text-stone-950 shadow-[3px_3px_0_#202b29] transition hover:-translate-y-0.5">{user ? "Craft humor →" : "Sign in to craft →"}</Link>
      </div>
    </section>
    {headline && <section className="mb-14" aria-labelledby="headline-title">
      <div className="mb-5 flex items-center gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-coral">Most upvoted this week</p><h2 id="headline-title" className="mt-1 text-3xl font-black">The headline humor</h2></div><div className="h-px flex-1 bg-stone-300" /></div>
      <div className="relative max-w-3xl"><span className="absolute -right-3 -top-3 z-10 rotate-6 rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-teal-950 shadow-[3px_3px_0_#115e59]">▲ {headline.upvotes} THIS WEEK</span><GenerationCard generation={headline} signedIn={Boolean(user)} /></div>
    </section>}

    <section aria-labelledby="collection-title">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-5 border-t border-stone-300 pt-6">
        <div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">Browse by time</p><h2 id="collection-title" className="mt-2 text-2xl font-black">{periods[period].label}</h2></div>
        <nav className="flex rounded-full bg-stone-200 p-1" aria-label="Choose humor collection period">
          {(Object.entries(periods) as [Period, (typeof periods)[Period]][]).map(([value, option]) => <Link key={value} href={`/feed?period=${value}`} aria-current={period === value ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${period === value ? "bg-teal-900 text-white shadow-sm" : "text-stone-600 hover:text-stone-950"}`}>{option.label}</Link>)}
        </nav>
      </div>
      {collection.length ? <div className="grid gap-5 md:grid-cols-2" aria-label={`${periods[period].label} AI-generated captions`}>
        {collection.map((generation) => <GenerationCard key={generation.id} generation={generation} signedIn={Boolean(user)} />)}
      </div> : <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-12 text-center"><h3 className="text-2xl font-semibold">No other humors in this collection yet.</h3><p className="mt-3 text-stone-600">Craft a caption and give the crowd something new to rate.</p></div>}
    </section>
  </main>;
}
