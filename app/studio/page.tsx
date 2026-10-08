import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isProfileComplete, requireProfile } from "@/lib/profile";
import { getGenerations } from "@/lib/generations";
import { GenerationCard } from "@/components/generation-card";
import { GenerationForm } from "./generation-form";

export default async function StudioPage() {
  const { profile } = await requireProfile();
  if (!isProfileComplete(profile)) redirect("/profile");
  const generations = await getGenerations(6);
  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12">
    <SiteHeader />
    <section className="pb-12 pt-16">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-800">Members’ studio · Make today’s post</p>
      <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">What did New York do now, {profile.first_name}?</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">Describe a moment that could be a photo, choose the comic energy, and Gemini will turn it into a caption for the community to rate.</p>
    </section>
    <section className="rounded-3xl bg-teal-900 p-8 text-white sm:p-12" aria-labelledby="generator-title">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-widest text-lime-300">Powered by Gemini</p><h2 id="generator-title" className="mt-3 text-3xl font-semibold">Build a caption contender</h2></div><span className="rounded-full border border-teal-600 px-3 py-1 text-xs text-teal-100">8 generations / hour</span></div>
      <GenerationForm />
    </section>
    <section className="mt-12" aria-labelledby="recent-title"><div className="flex items-center justify-between gap-4"><h2 id="recent-title" className="text-xl font-semibold">Recent contenders</h2><a href="/feed" className="text-sm font-medium text-teal-800 hover:underline">See the full feed →</a></div>{generations.length ? <div className="mt-5 grid gap-5 md:grid-cols-2">{generations.map(generation => <GenerationCard key={generation.id} generation={generation} signedIn />)}</div> : <p className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-stone-600">No captions yet. Yours can be first.</p>}</section>
  </main>;
}
