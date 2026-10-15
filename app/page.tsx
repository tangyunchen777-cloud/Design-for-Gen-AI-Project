import { connection } from "next/server";
import Image from "next/image";
import { getAiTools } from "@/lib/ai-tools";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const memeDrops = [
  {
    src: "/memes/library-all-nighter.jpg",
    alt: "Exhausted student asleep at a library table surrounded by many iced coffee cups and books",
    label: "Butler, 2:47 AM",
    caption: "I opened one reading and somehow it became tomorrow.",
    color: "bg-lime-200",
    rotation: "md:-rotate-1",
  },
  {
    src: "/memes/subway-sprint.jpg",
    alt: "Student sprinting toward a subway train while its doors close",
    label: "The 1 train, personally",
    caption: "Saw my 9:10 on the calendar and chose violence.",
    color: "bg-sky-100",
    rotation: "md:rotate-1",
  },
  {
    src: "/memes/grocery-stairs.jpg",
    alt: "Student climbing apartment stairs behind a comically large tower of grocery bags",
    label: "NYC leg day",
    caption: "Paying Manhattan rent so groceries can become an Olympic sport.",
    color: "bg-rose-100",
    rotation: "md:-rotate-1",
  },
] as const;

export default async function Home() {
  await connection();
  const tools = await getAiTools();
  const categories = new Set(tools.map((tool) => tool.category)).size;

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
      <section className="mb-20" aria-labelledby="meme-drop-title">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-t border-stone-300 pt-7">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">Fresh from the group chat</p><h2 id="meme-drop-title" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Campus meme drop</h2></div>
          <Link href="/studio" className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-stone-950 shadow-[3px_3px_0_#202b29] transition hover:-translate-y-0.5">Make yours →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {memeDrops.map((meme) => <article key={meme.src} className={`group overflow-hidden rounded-3xl border border-stone-200 bg-white p-3 shadow-[5px_5px_0_#d6d3d1] transition hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[8px_8px_0_#134e4a] ${meme.rotation}`}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
              <Image src={meme.src} alt={meme.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
              <span className={`absolute left-3 top-3 -rotate-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-stone-900 shadow-[2px_2px_0_#202b29] ${meme.color}`}>{meme.label}</span>
            </div>
            <blockquote className="px-3 pb-4 pt-5 text-xl font-black leading-snug tracking-tight text-stone-900">“{meme.caption}”</blockquote>
            <div className="mx-3 mb-2 flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] font-bold uppercase tracking-wider text-stone-500"><span>AI-crafted · human-approved</span><span aria-hidden="true">✦</span></div>
          </article>)}
        </div>
      </section>
      <section aria-labelledby="collection-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-t border-stone-300 pt-6">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">More from the lab</p><h2 id="collection-title" className="mt-2 text-xl font-semibold">AI playground</h2></div>
          <p className="text-sm text-stone-600">{tools.length} tools <span aria-hidden="true">/</span> {categories} categories</p>
        </div>
        {tools.length === 0 ? (
          <p className="rounded-2xl border border-stone-300 bg-white p-8 text-stone-600">No tools yet. Check back soon for new additions.</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-3">
            {tools.map((tool, index) => (
              <li key={tool.id} className="flex min-h-72 flex-col rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
                <div className="mb-10 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900">{tool.category}</span>
                  <span className="font-mono text-sm text-stone-400">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">{tool.name}</h3>
                <p className="mt-3 leading-7 text-stone-600">{tool.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-stone-300 pt-6 text-xs text-stone-600">
        <span>Design for Gen AI · Humor Lab</span><Link href="/privacy" className="hover:underline">Privacy</Link><span>A little imagination goes a long way.</span>
      </footer>
    </main>
  );
}
