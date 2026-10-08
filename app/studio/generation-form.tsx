"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { generateCaption, type GenerationState } from "./actions";

function GenerateButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending} className="rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold text-teal-950 transition hover:bg-lime-200 disabled:opacity-60">
    {pending ? "Creating the caption…" : "Generate & publish →"}
  </button>;
}

export function GenerationForm() {
  const [state, action] = useActionState(generateCaption, {} as GenerationState);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return <form action={action} className="mt-8 grid gap-6">
    <label className="grid gap-2 text-sm font-medium" htmlFor="scene">
      Prompt the caption <span className="font-normal text-teal-200">{previewUrl ? "(optional when a photo is attached)" : "(required without a photo)"}</span>
      <textarea id="scene" name="scene" required={!previewUrl} minLength={previewUrl ? undefined : 12} maxLength={500} rows={4}
        placeholder="A first-year student carrying six grocery bags onto the 1 train…"
        className="resize-y rounded-2xl border border-teal-700 bg-teal-950/40 px-4 py-3 font-normal text-white placeholder:text-teal-300 focus:border-lime-300" />
    </label>
    <div>
      <label className="text-sm font-medium" htmlFor="image">Add a photo <span className="font-normal text-teal-200">(optional)</span></label>
      <div className="mt-3 grid gap-4 rounded-2xl border border-dashed border-teal-600 bg-teal-950/30 p-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center">
        <div>
          <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
            aria-describedby="image-help"
            className="block w-full text-sm text-teal-100 file:mr-4 file:rounded-full file:border-0 file:bg-teal-100 file:px-4 file:py-2 file:font-semibold file:text-teal-950" />
          <p id="image-help" className="mt-3 text-xs leading-5 text-teal-200">Attach a JPG, PNG, or WebP up to 4 MB and Gemini will caption what it sees. Published photos appear in the public feed.</p>
        </div>
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-teal-800">
          {/* A local blob preview cannot be processed by next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {previewUrl ? <img src={previewUrl} alt="Selected upload preview" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center px-3 text-center text-xs text-teal-200">Optional photo preview</div>}
        </div>
      </div>
    </div>
    <fieldset>
      <legend className="text-sm font-medium">Pick the energy</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {[["witty", "Witty", "Clever and quick"], ["deadpan", "Deadpan", "Dry, zero reaction"], ["absurd", "Absurd", "Unexpected chaos"]].map(([value, label, detail], index) => <label key={value} className="rounded-2xl border border-teal-700 p-4 hover:border-lime-300">
          <input type="radio" name="style" value={value} defaultChecked={index === 0} className="mr-2 accent-lime-300" />
          <span className="font-medium">{label}</span><span className="mt-1 block text-xs text-teal-200">{detail}</span>
        </label>)}
      </div>
    </fieldset>
    <div className="flex flex-wrap items-center gap-4"><GenerateButton /><p className="text-xs text-teal-200">Use a written prompt, a photo, or both. Gemini writes one caption and the full prompt is saved for transparency.</p></div>
    {state.error && <p role="alert" className="rounded-xl border border-red-300/50 bg-red-950/30 p-4 text-sm text-red-100">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl border border-lime-300/50 bg-lime-950/30 p-4 text-sm text-lime-100">{state.success}</p>}
  </form>;
}
