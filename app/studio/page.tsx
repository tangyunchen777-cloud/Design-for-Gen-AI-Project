import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { isProfileComplete, requireProfile } from "@/lib/profile";
import { getAiTools } from "@/lib/ai-tools";

export default async function StudioPage() {
  const { profile } = await requireProfile();
  if (!isProfileComplete(profile)) redirect("/profile");
  const tools = await getAiTools();
  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12">
    <SiteHeader />
    <section className="pb-12 pt-16">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-800">Members’ studio · Just for you</p>
      <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">Welcome to the punchline, {profile.first_name}.</h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">A private space to explore our image-to-caption project. One image, a little imagination, and a reason to laugh.</p>
    </section>
    <section className="rounded-3xl bg-teal-900 p-8 text-white sm:p-12" aria-labelledby="workflow-title">
      <h2 id="workflow-title" className="text-2xl font-semibold">The idea behind Humor Lab</h2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3">{[
        ["01", "Start with an image", "An everyday moment, an unexpected expression, or something delightfully awkward."],
        ["02", "Find its funny side", "Imagine a playful caption, a dry observation, or a little friendly sarcasm."],
        ["03", "Share the laugh", "Choose the comment that turns a simple picture into a memorable joke."],
      ].map(([number, title, detail]) => <li key={number}><p className="font-mono text-sm text-teal-200">{number}</p><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-6 text-teal-50">{detail}</p></li>)}</ol>
      <p className="mt-9 border-t border-teal-700 pt-5 text-sm text-teal-100">This is our project concept. AI caption generation is coming in a future version.</p>
    </section>
    <section className="mt-12" aria-labelledby="ideas-title"><h2 id="ideas-title" className="text-xl font-semibold">Project ideas from our collection</h2><ul className="mt-5 grid gap-5 md:grid-cols-3">{tools.map(tool => <li key={tool.id} className="rounded-2xl border border-stone-200 bg-white p-7"><p className="text-xs font-medium text-teal-800">{tool.category}</p><h3 className="mt-4 text-xl font-semibold">{tool.name}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{tool.description}</p></li>)}</ul></section>
  </main>;
}
