"use client";

import { useActionState } from "react";
import { saveProfile } from "./actions";
import type { Profile } from "@/lib/profile";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, action, pending] = useActionState(saveProfile, {});
  return <form action={action} className="space-y-6">
    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block text-sm font-medium">First name
        <input name="first_name" autoComplete="given-name" defaultValue={profile.first_name ?? ""} maxLength={80} required className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3" />
      </label>
      <label className="block text-sm font-medium">Last name
        <input name="last_name" autoComplete="family-name" defaultValue={profile.last_name ?? ""} maxLength={80} required className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3" />
      </label>
    </div>
    <div>
      <label className="block text-sm font-medium" htmlFor="avatar">Profile photo <span className="font-normal text-stone-500">(optional)</span></label>
      <input id="avatar" name="avatar" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby="photo-help" className="mt-3 block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-teal-900" />
      <p id="photo-help" className="mt-3 text-xs leading-5 text-stone-500">JPG, PNG, or WebP, up to 2 MB. Your photo is stored privately and shown in your profile.</p>
    </div>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-teal-50 p-4 text-sm text-teal-900">{state.success}</p>}
    <button disabled={pending} className="rounded-full bg-teal-900 px-7 py-3 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
  </form>;
}
