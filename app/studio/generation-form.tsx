"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { previewCaption, publishCaption, type CaptionPreview } from "./actions";

const vibes = [
  { value: "witty", label: "Witty", detail: "Clever + quick", emoji: "✦" },
  { value: "deadpan", label: "Deadpan", detail: "Dry + straight-faced", emoji: "—" },
  { value: "absurd", label: "Absurd", detail: "Delightfully chaotic", emoji: "?!" },
] as const;

async function cropToFourThree(file: File, focusX: number, focusY: number) {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("That image could not be cropped."));
      element.src = sourceUrl;
    });
    const targetWidth = 1200;
    const targetHeight = 900;
    const targetRatio = targetWidth / targetHeight;
    const sourceRatio = image.naturalWidth / image.naturalHeight;
    let sourceWidth = image.naturalWidth;
    let sourceHeight = image.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (sourceRatio > targetRatio) {
      sourceWidth = image.naturalHeight * targetRatio;
      sourceX = (image.naturalWidth - sourceWidth) * (focusX / 100);
    } else {
      sourceHeight = image.naturalWidth / targetRatio;
      sourceY = (image.naturalHeight - sourceHeight) * (focusY / 100);
    }

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not prepare the crop.");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("That image could not be cropped.")),
      "image/jpeg",
      0.9,
    ));
    const baseName = file.name.replace(/\.[^.]+$/, "") || "humor-photo";
    return new File([blob], `${baseName}-cropped.jpg`, { type: "image/jpeg", lastModified: file.lastModified });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export function GenerationForm({ initialScene = "" }: { initialScene?: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const preparedImageRef = useRef<File | null>(null);
  const [mode, setMode] = useState<"photo" | "prompt">(initialScene ? "prompt" : "photo");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [preview, setPreview] = useState<CaptionPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCrafting, startCrafting] = useTransition();
  const [isPublishing, startPublishing] = useTransition();

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  function resetPreview() {
    preparedImageRef.current = null;
    setPreview(null);
    setMessage(null);
  }

  function changeMode(nextMode: "photo" | "prompt") {
    if (nextMode === mode) return;
    setMode(nextMode);
    setImageUrl(null);
    setSelectedImage(null);
    resetPreview();
  }

  function handlePreview(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const form = formRef.current;
    if (!form || !form.reportValidity()) return;
    setMessage(null);
    startCrafting(async () => {
      const formData = new FormData(form);
      if (mode === "photo" && selectedImage) {
        try {
          const croppedImage = await cropToFourThree(selectedImage, cropX, cropY);
          preparedImageRef.current = croppedImage;
          formData.set("image", croppedImage);
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "That image could not be cropped.");
          return;
        }
      }
      const result = await previewCaption(formData);
      if (result.error) {
        setPreview(null);
        setMessage(result.error);
        return;
      }
      setPreview(result.preview ?? null);
    });
  }

  function handlePublish() {
    const form = formRef.current;
    if (!form || !preview) return;
    setMessage(null);
    startPublishing(async () => {
      const formData = new FormData(form);
      if (preparedImageRef.current) formData.set("image", preparedImageRef.current);
      const result = await publishCaption(preview.token, formData);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      router.push("/feed");
      router.refresh();
    });
  }

  const busy = isCrafting || isPublishing;

  return <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,.72fr)] lg:items-start">
    <form ref={formRef} onSubmit={handlePreview} onChange={resetPreview} className="grid gap-7">
      <input type="hidden" name="mode" value={mode} />

      <section aria-labelledby="moment-title">
        <div className="flex items-start gap-3">
          <span className="step-dot" aria-hidden="true">1</span>
          <div><h3 id="moment-title" className="font-semibold text-stone-900">Add your moment</h3><p className="mt-1 text-sm text-stone-500">Start with a photo, or describe the scene instead.</p></div>
        </div>
        <div className="ml-11 mt-4 inline-flex rounded-full bg-stone-100 p-1" aria-label="Choose an input type">
          <button type="button" onClick={() => changeMode("photo")} aria-pressed={mode === "photo"} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "photo" ? "bg-teal-900 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}>📸 Photo</button>
          <button type="button" onClick={() => changeMode("prompt")} aria-pressed={mode === "prompt"} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${mode === "prompt" ? "bg-teal-900 text-white shadow-sm" : "text-stone-600 hover:text-stone-900"}`}>✎ Write a scene</button>
        </div>

        <div className="ml-11 mt-4">
          {mode === "photo" ? <div className={`overflow-hidden rounded-2xl border-2 border-dashed transition ${imageUrl ? "border-teal-700 bg-teal-50" : "border-stone-300 bg-stone-50 hover:border-teal-500"}`}>
            <label htmlFor="image" className="block cursor-pointer">
              {imageUrl ? <div className="relative">
                {/* Blob URLs are local previews and cannot use next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Selected photo crop preview" className="aspect-[4/3] w-full object-cover" style={{ objectPosition: `${cropX}% ${cropY}%` }} />
                <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-2 text-xs font-semibold text-stone-800 shadow">Change photo</span>
              </div> : <div className="grid min-h-48 place-items-center p-8 text-center">
                <div><span className="text-4xl" aria-hidden="true">＋</span><p className="mt-2 font-semibold text-stone-800">Drop in a funny moment</p><p className="mt-1 text-xs text-stone-500">JPG, PNG, or WebP · 4 MB max</p></div>
              </div>}
              <input id="image" name="image" type="file" accept="image/jpeg,image/png,image/webp" required className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  setSelectedImage(file ?? null);
                  setImageUrl(file ? URL.createObjectURL(file) : null);
                  setCropX(50);
                  setCropY(50);
                  resetPreview();
                }} />
            </label>
            {imageUrl && <fieldset className="border-t border-stone-200 bg-white px-4 py-4">
              <legend className="px-1 text-sm font-semibold text-stone-800">Adjust crop</legend>
              <p className="mb-3 text-xs leading-5 text-stone-500">Move the frame until the important part of your photo is centered.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-medium text-stone-600">Horizontal position
                  <input type="range" min="0" max="100" value={cropX} onChange={(event) => setCropX(Number(event.target.value))} className="mt-2 w-full accent-teal-800" />
                </label>
                <label className="text-xs font-medium text-stone-600">Vertical position
                  <input type="range" min="0" max="100" value={cropY} onChange={(event) => setCropY(Number(event.target.value))} className="mt-2 w-full accent-teal-800" />
                </label>
              </div>
            </fieldset>}
            <details className="border-t border-stone-200 bg-white px-4 py-3">
              <summary className="cursor-pointer text-sm font-medium text-teal-800">Add a direction <span className="font-normal text-stone-400">(optional)</span></summary>
              <textarea name="scene" maxLength={500} rows={2} placeholder="e.g. Make it about surviving the 1 train"
                className="mt-3 w-full resize-y rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-700" />
            </details>
          </div> : <label className="grid gap-2 text-sm font-medium text-stone-800" htmlFor="scene">
            What happened?
            <textarea id="scene" name="scene" required minLength={12} maxLength={500} rows={5}
              defaultValue={initialScene}
              placeholder="A first-year carrying six grocery bags onto the 1 train…"
              className="resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3 font-normal text-stone-900 placeholder:text-stone-400 focus:border-teal-700" />
          </label>}
        </div>
      </section>

      <fieldset>
        <legend className="flex items-start gap-3">
          <span className="step-dot" aria-hidden="true">2</span>
          <span><span className="block font-semibold text-stone-900">Choose the vibe</span><span className="mt-1 block text-sm font-normal text-stone-500">How should the joke land?</span></span>
        </legend>
        <div className="ml-11 mt-4 grid grid-cols-3 gap-2">
          {vibes.map((vibe, index) => <label key={vibe.value} className="group cursor-pointer">
            <input type="radio" name="style" value={vibe.value} defaultChecked={index === 0} className="peer sr-only" />
            <span className="flex min-h-24 flex-col justify-between rounded-2xl border border-stone-300 bg-white p-3 transition group-hover:-translate-y-0.5 group-hover:border-teal-600 peer-checked:border-teal-800 peer-checked:bg-lime-100 peer-checked:shadow-[3px_3px_0_#115e59]">
              <span className="text-lg font-black text-teal-800" aria-hidden="true">{vibe.emoji}</span>
              <span><span className="block text-sm font-semibold text-stone-900">{vibe.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-stone-500">{vibe.detail}</span></span>
            </span>
          </label>)}
        </div>
      </fieldset>

      <div className="flex items-start gap-3">
        <span className="step-dot" aria-hidden="true">3</span>
        <div className="min-w-0 flex-1">
          <button disabled={busy} className="w-full rounded-2xl bg-coral px-6 py-4 font-bold text-stone-950 shadow-[4px_4px_0_#202b29] transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#202b29] disabled:translate-y-0 disabled:opacity-60">
            {isCrafting ? "Crafting your joke…" : "Craft my caption →"}
          </button>
          <p className="mt-3 text-center text-xs text-stone-500">You’ll preview it before anything is published.</p>
        </div>
      </div>
      {message && <p role="alert" className="ml-11 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{message}</p>}
    </form>

    <aside className="preview-paper lg:sticky lg:top-6" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[.2em] text-teal-800">Private preview</p>
        <span className="rounded-full bg-lime-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-950">Not posted</span>
      </div>
      {preview ? <div className="mt-7">
        {preview.hasImage && imageUrl ? <>
          {/* Blob URLs are local previews and cannot use next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="Captioned photo preview" className="aspect-[4/3] w-full rounded-xl object-cover" style={{ objectPosition: `${cropX}% ${cropY}%` }} />
        </> : <div className="grid aspect-[4/3] place-items-center rounded-xl bg-[radial-gradient(circle_at_20%_20%,#bef264_0,transparent_30%),radial-gradient(circle_at_80%_70%,#fb7185_0,transparent_34%),#134e4a] text-6xl" aria-hidden="true">✦</div>}
        <blockquote className="mt-6 text-2xl font-bold leading-snug tracking-tight text-stone-900">“{preview.caption}”</blockquote>
        <p className="mt-3 text-xs text-stone-500">Nothing is public yet. Love it, or let AI take another swing.</p>
        <div className="mt-6 grid gap-3">
          <button type="button" onClick={() => handlePreview()} disabled={busy} className="rounded-full border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 hover:border-teal-700 disabled:opacity-60">{isCrafting ? "Trying another…" : "↻ Try another"}</button>
          <button type="button" onClick={handlePublish} disabled={busy} className="rounded-full bg-teal-900 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">{isPublishing ? "Publishing…" : "Publish to Humors →"}</button>
        </div>
      </div> : <div className="grid min-h-96 place-items-center py-10 text-center">
        <div><div className="mx-auto grid h-20 w-20 rotate-3 place-items-center rounded-2xl bg-lime-200 text-4xl shadow-[5px_5px_0_#115e59]" aria-hidden="true">👀</div><h3 className="mt-7 text-xl font-bold text-stone-900">Your joke lands here first.</h3><p className="mx-auto mt-2 max-w-60 text-sm leading-6 text-stone-500">Craft a caption, check it, then decide whether it deserves the feed.</p></div>
      </div>}
    </aside>
  </div>;
}
