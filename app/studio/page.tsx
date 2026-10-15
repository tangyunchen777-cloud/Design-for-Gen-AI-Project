import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isProfileComplete, requireProfile } from "@/lib/profile";
import { getGenerations } from "@/lib/generations";
import { GenerationCard } from "@/components/generation-card";
import { GenerationForm } from "./generation-form";

export default async function StudioPage() {
  const { profile } = await requireProfile();
  if (!isProfileComplete(profile)) redirect("/profile");
  const generations = await getGenerations(4);
  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12">
    <SiteHeader />
    <section className="relative overflow-hidden pb-10 pt-14 sm:pt-20">
      <span className="absolute right-2 top-9 hidden rotate-12 rounded-full bg-lime-300 px-5 py-3 text-sm font-black shadow-[4px_4px_0_#115e59] sm:block" aria-hidden="true">MAKE ’EM LAUGH</span>
      <p className="text-sm font-bold uppercase tracking-[.2em] text-teal-800">Craft humor</p>
      <h1 className="mt-4 max-w-3xl text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl">Your moment.<br /><span className="marker-swipe">AI’s punchline.</span></h1>
      <p className="mt-5 max-w-xl text-lg leading-8 text-stone-600">Hi {profile.first_name}—three tiny steps, one potentially great joke. You approve the caption before it goes public.</p>
    </section>
    <section className="paper-grid rounded-[2rem] border border-stone-200 bg-white p-5 shadow-[8px_8px_0_#d6d3d1] sm:p-9" aria-labelledby="generator-title">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-200 pb-6"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">Powered by Gemini</p><h2 id="generator-title" className="mt-2 text-2xl font-black text-stone-900">The joke workshop</h2></div><span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">8 published humors / hour</span></div>
      <GenerationForm />
    </section>
    <section className="mt-16" aria-labelledby="recent-title"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">Freshly published</p><h2 id="recent-title" className="mt-2 text-2xl font-black">Fresh from the lab</h2></div><a href="/feed" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-teal-800 hover:border-teal-700">See all humors →</a></div>{generations.length ? <div className="mt-6 grid gap-5 md:grid-cols-2">{generations.map(generation => <GenerationCard key={generation.id} generation={generation} signedIn />)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-stone-600">No humors yet. Yours can be first.</p>}</section>
  </main>;
}
