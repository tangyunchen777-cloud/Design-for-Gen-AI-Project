import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/profile/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-stone-300 pb-6">
      <Link href="/" className="text-sm font-semibold tracking-widest">HUMOR LAB <span className="text-teal-700">/</span> GEN AI</Link>
      <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-5 text-sm">
        <Link href="/" className="hover:underline">Collection</Link>
        {user ? <>
          <Link href="/studio" className="hover:underline">Members’ studio</Link>
          <Link href="/profile" className="hover:underline">My profile</Link>
          <form action={signOut}><button className="rounded-full border border-stone-300 px-4 py-2 hover:bg-white">Sign out</button></form>
        </> : <Link href="/login" className="rounded-full bg-teal-900 px-5 py-2 text-white hover:bg-teal-800">Sign in</Link>}
      </nav>
    </header>
  );
}
