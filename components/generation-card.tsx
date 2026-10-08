import Link from "next/link";
import type { Generation } from "@/lib/generations";
import { VoteControls } from "@/components/vote-controls";

export function GenerationCard({ generation, signedIn }: { generation: Generation; signedIn: boolean }) {
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(generation.created_at));
  return <article className="flex h-full flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
    <div className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-wider text-stone-500"><span>{generation.style}</span><span>{date}</span></div>
    <blockquote className="mt-8 text-2xl font-semibold leading-snug tracking-tight">“{generation.caption}”</blockquote>
    <p className="mt-5 text-sm leading-6 text-stone-600"><span className="font-medium text-stone-900">The scene:</span> {generation.scene}</p>
    <div className="mt-auto flex items-end justify-between gap-4 border-t border-stone-200 pt-6">
      {signedIn ? <VoteControls generationId={generation.id} upvotes={generation.upvotes} downvotes={generation.downvotes} myVote={generation.my_vote} /> : <Link href="/login" className="text-sm font-medium text-teal-800 hover:underline">Sign in to vote →</Link>}
      <p className="text-right text-xs text-stone-400">Score<br /><span className="text-lg font-semibold text-stone-700">{generation.score}</span></p>
    </div>
  </article>;
}
