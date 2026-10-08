"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateCaption, type GenerationState } from "./actions";

function GenerateButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-teal-950 transition hover:bg-lime-200 disabled:opacity-60">
    {pending ? "Writing the punchline…" : "Generate & publish →"}
  </button>;
}

export function GenerationForm() {
  const [state, action] = useActionState(generateCaption, {} as GenerationState);
  return <form action={action} className="mt-8 grid gap-6">
    <label className="grid gap-2 text-sm font-medium" htmlFor="scene">
      Describe the image or moment
      <textarea id="scene" name="scene" required minLength={12} maxLength={500} rows={4}
        placeholder="A first-year student carrying six grocery bags onto the 1 train…"
        className="resize-y rounded-2xl border border-teal-700 bg-teal-950/40 px-4 py-3 font-normal text-white placeholder:text-teal-300 focus:border-lime-300" />
    </label>
    <fieldset>
      <legend className="text-sm font-medium">Pick the energy</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[["witty", "Witty", "Clever and quick"], ["deadpan", "Deadpan", "Dry, zero reaction"], ["absurd", "Absurd", "Unexpected chaos"]].map(([value, label, detail], index) => <label key={value} className="rounded-2xl border border-teal-700 p-4 hover:border-lime-300">
          <input type="radio" name="style" value={value} defaultChecked={index === 0} className="mr-2 accent-lime-300" />
          <span className="font-medium">{label}</span><span className="mt-1 block text-xs text-teal-200">{detail}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="flex flex-wrap items-center gap-4"><GenerateButton /><p className="text-xs text-teal-200">Gemini writes one caption. Your full prompt is saved for transparency.</p></div>
    {state.error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-950/30 p-4 text-sm text-red-100">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl border border-lime-300/50 bg-lime-950/30 p-4 text-sm text-lime-100">{state.success}</p>}
  </form>;
}
