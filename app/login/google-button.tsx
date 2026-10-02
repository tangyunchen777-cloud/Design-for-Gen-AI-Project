"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function signIn() {
    setPending(true);
    setError("");
    try {
      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setError("Google sign-in could not start. Please try again.");
      setPending(false);
    }
  }
  return <>
    <button onClick={signIn} disabled={pending} className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-5 py-4 font-medium hover:bg-stone-50 disabled:opacity-60">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5"><path fill="#4285F4" d="M22.56 12.25c0-.73-.06-1.42-.19-2.09H12v3.96h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-7.95Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.8l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.87 0-5.3-1.94-6.17-4.55H2.15v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.83 13.95a6.6 6.6 0 0 1 0-3.9V7.21H2.15a11 11 0 0 0 0 9.58l3.68-2.84Z"/><path fill="#EA4335" d="M12 5.5c1.62 0 3.07.56 4.21 1.64l3.15-3.15A10.55 10.55 0 0 0 12 1a11 11 0 0 0-9.85 6.21l3.68 2.84C6.7 7.44 9.13 5.5 12 5.5Z"/></svg>
      {pending ? "Connecting to Google…" : "Continue with Google"}
    </button>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
  </>;
}
