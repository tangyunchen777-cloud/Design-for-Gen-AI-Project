import Link from "next/link";
import { getDailyPrompt } from "@/lib/daily-prompt";

export function DailyPrompt({ signedIn }: { signedIn: boolean }) {
  const prompt = getDailyPrompt();
  const studioPath = `/studio?prompt=${encodeURIComponent(prompt)}`;
  const href = signedIn ? studioPath : `/login?next=${encodeURIComponent(studioPath)}`;

  return <section className="relative mb-16 overflow-hidden rounded-[2rem] bg-teal-950 p-7 text-white shadow-[8px_8px_0_#bef264] sm:p-10" aria-labelledby="daily-prompt-title">
    <span className="absolute -right-8 -top-8 h-32 w-32 rounded-full border-[18px] border-coral/80" aria-hidden="true" />
    <div className="relative grid gap-7 lg:grid-cols-[.6fr_1.4fr_auto] lg:items-center">
      <div><p className="text-xs font-bold uppercase tracking-[.22em] text-lime-300">Today’s comedy seed</p><h2 id="daily-prompt-title" className="mt-2 text-2xl font-black">Daily prompt drop</h2></div>
      <blockquote className="text-xl font-semibold leading-8 text-teal-50">“{prompt}”</blockquote>
      <Link href={href} className="w-fit rounded-full bg-coral px-5 py-3 text-sm font-bold text-stone-950 shadow-[3px_3px_0_#fff] transition hover:-translate-y-0.5">{signedIn ? "Caption this →" : "Sign in to play →"}</Link>
    </div>
  </section>;
}
