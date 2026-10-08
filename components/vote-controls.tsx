"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { voteForGeneration, type VoteState } from "@/app/studio/actions";

function VoteButton({ label, active }: { label: string; active: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={pending} aria-pressed={active}
    className={`rounded-full border px-3 py-2 text-sm transition ${active ? "border-teal-900 bg-teal-900 text-white" : "border-stone-300 bg-white hover:border-teal-700"} disabled:opacity-50`}>
    {label}
  </button>;
}

export function VoteControls({ generationId, upvotes, downvotes, myVote }: {
  generationId: string;
  upvotes: number;
  downvotes: number;
  myVote: -1 | 1 | null;
}) {
  const [upState, submitUp] = useActionState(voteForGeneration.bind(null, generationId, 1), {} as VoteState);
  const [downState, submitDown] = useActionState(voteForGeneration.bind(null, generationId, -1), {} as VoteState);
  const error = upState.error || downState.error;
  return <div><div className="flex items-center gap-2" aria-label="Rate this caption">
    <form action={submitUp}><VoteButton label={`▲ ${upvotes}`} active={myVote === 1} /></form>
    <form action={submitDown}><VoteButton label={`▼ ${downvotes}`} active={myVote === -1} /></form>
  </div>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>;
}
