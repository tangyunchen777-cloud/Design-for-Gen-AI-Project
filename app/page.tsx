import { connection } from "next/server";
import Link from "next/link";
import { FeaturedMemes } from "@/components/featured-memes";
import { SiteHeader } from "@/components/site-header";
import { DailyPrompt } from "@/components/daily-prompt";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12 sm:py-16">
      <SiteHeader />
      <section className="grid gap-12 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_.9fr] lg:items-center" aria-labelledby="page-title">
        <div>
          <p className="mb-5 text-sm font-bold uppercase tracking-[.2em] text-teal-800">Serious about being unserious</p>
          <h1 id="page-title" className="max-w-3xl text-5xl font-black leading-[.98] tracking-tight sm:text-7xl">Turn real life into <span className="marker-swipe">a punchline.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">Add a campus photo or describe the chaos. AI crafts a caption, you approve it, and the crowd decides if it’s funny.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/feed" className="inline-block rounded-full bg-teal-900 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800">Browse humors →</Link><Link href="/studio" className="inline-block rounded-full bg-coral px-6 py-3 text-sm font-bold text-stone-950 shadow-[3px_3px_0_#202b29] transition hover:-translate-y-0.5">Craft humor</Link></div>
        </div>
        <div className="relative mx-auto w-full max-w-md py-8" aria-hidden="true">
          <span className="absolute -left-3 top-0 -rotate-12 rounded-full bg-lime-300 px-4 py-2 text-xs font-black shadow-[3px_3px_0_#115e59]">SEEN @ COLUMBIA</span>
          <div className="rotate-2 rounded-[2rem] bg-teal-900 p-6 text-white shadow-[10px_10px_0_#fb7185]">
            <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-[radial-gradient(circle_at_25%_20%,#bef264_0,transparent_28%),radial-gradient(circle_at_80%_75%,#fb7185_0,transparent_32%),#0f766e] text-7xl">🚇</div>
            <p className="mt-6 text-2xl font-bold leading-snug">“My academic comeback is experiencing signal delays.”</p>
            <div className="mt-5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-teal-100"><span>Deadpan vibe</span><span>▲ 42</span></div>
          </div>
          <span className="absolute -bottom-2 right-1 rotate-6 rounded-xl bg-white px-4 py-3 text-sm font-black shadow-[3px_3px_0_#202b29]">TOO REAL ✦</span>
        </div>
      </section>
      <section className="mb-16 grid gap-3 sm:grid-cols-3" aria-label="How Humor Lab works">
        {[["01", "Add it", "Upload a photo or write the scene."], ["02", "Vibe it", "Choose witty, deadpan, or absurd."], ["03", "Approve it", "Preview first. Publish only when ready."]].map(([number, title, copy]) => <div key={number} className="rounded-2xl border border-stone-200 bg-white p-5"><span className="font-mono text-xs font-bold text-teal-700">{number}</span><h2 className="mt-5 text-xl font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p></div>)}
      </section>
      <DailyPrompt signedIn={Boolean(user)} />
      <FeaturedMemes />
      <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-stone-300 pt-6 text-xs text-stone-600">
        <span>Design for Gen AI · Humor Lab</span><Link href="/privacy" className="hover:underline">Privacy</Link><span>A little imagination goes a long way.</span>
      </footer>
    </main>
  );
}
