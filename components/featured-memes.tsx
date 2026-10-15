import Image from "next/image";
import Link from "next/link";

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

export function FeaturedMemes({ signedIn }: { signedIn?: boolean }) {
  return <section className="mb-16" aria-labelledby="featured-memes-title">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-t border-stone-300 pt-7">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">Fresh from the group chat</p><h2 id="featured-memes-title" className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Featured humors</h2><p className="mt-2 text-sm text-stone-500">A few AI-crafted examples from the Humor Lab.</p></div>
      <Link href={signedIn === false ? "/login" : "/studio"} className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-stone-950 shadow-[3px_3px_0_#202b29] transition hover:-translate-y-0.5">Make yours →</Link>
    </div>
    <div className="grid gap-6 md:grid-cols-3">
      {memeDrops.map((meme) => <article key={meme.src} className={`group overflow-hidden rounded-3xl border border-stone-200 bg-white p-3 shadow-[5px_5px_0_#d6d3d1] transition hover:z-10 hover:-translate-y-1 hover:rotate-0 hover:shadow-[8px_8px_0_#134e4a] ${meme.rotation}`}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
          <Image src={meme.src} alt={meme.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
          <span className={`absolute left-3 top-3 -rotate-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-stone-900 shadow-[2px_2px_0_#202b29] ${meme.color}`}>{meme.label}</span>
        </div>
        <blockquote className="px-3 pb-4 pt-5 text-xl font-black leading-snug tracking-tight text-stone-900">“{meme.caption}”</blockquote>
        <div className="mx-3 mb-2 flex items-center justify-between border-t border-stone-200 pt-3 text-[10px] font-bold uppercase tracking-wider text-stone-500"><span>AI-crafted · featured example</span><span aria-hidden="true">✦</span></div>
      </article>)}
    </div>
  </section>;
}
