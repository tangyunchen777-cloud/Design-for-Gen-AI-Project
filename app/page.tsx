import { connection } from "next/server";
import { getAiTools } from "@/lib/ai-tools";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default async function Home() {
  await connection();
  const tools = await getAiTools();
  const categories = new Set(tools.map((tool) => tool.category)).size;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12 sm:py-16">
      <SiteHeader />
      <section className="pb-12 pt-16 sm:pt-24" aria-labelledby="page-title">
        <p className="mb-5 text-sm font-medium uppercase tracking-widest text-teal-800">Serious about being unserious</p>
        <h1 id="page-title" className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight sm:text-7xl">Every picture has a funny side.</h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600">We’re exploring how AI can turn images into funny comments. Discover our project ideas, build your profile, and join the members’ studio.</p>
        <Link href="/studio" className="mt-8 inline-block rounded-full bg-teal-900 px-6 py-3 text-sm font-medium text-white hover:bg-teal-800">Explore the studio →</Link>
      </section>
      <section aria-labelledby="collection-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-t border-stone-300 pt-6">
          <h2 id="collection-title" className="text-xl font-semibold">The collection</h2>
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
        <span>Design for Gen AI · Humor Lab</span><span>A little imagination goes a long way.</span>
      </footer>
    </main>
  );
}
