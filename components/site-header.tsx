import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/profile/actions";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <header className="flex flex-wrap items-center justify-between gap-5 border-b border-stone-300 pb-5">
      <Link href="/" className="group flex items-center gap-2 font-black tracking-tight"><span className="grid h-9 w-9 -rotate-3 place-items-center rounded-xl bg-lime-300 text-lg shadow-[2px_2px_0_#115e59] transition group-hover:rotate-3" aria-hidden="true">HA</span><span>HUMOR LAB</span></Link>
      <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        <Link href="/feed" className="rounded-full px-4 py-2.5 text-stone-700 transition hover:bg-white hover:text-teal-900">Humors</Link>
        {user ? <>
          <Link href="/studio" className="rounded-full bg-coral px-4 py-2.5 text-stone-950 shadow-[2px_2px_0_#202b29] transition hover:-translate-y-0.5">Craft humor</Link>
          <Link href="/profile" className="rounded-full px-4 py-2.5 text-stone-700 transition hover:bg-white hover:text-teal-900">Profile</Link>
          <form action={signOut}><button className="rounded-full border border-stone-300 bg-white px-4 py-2 hover:border-teal-700">Sign out</button></form>
        </> : <Link href="/login?next=%2Fstudio" className="rounded-full bg-teal-900 px-5 py-2.5 text-white hover:bg-teal-800">Sign in to craft</Link>}
      </nav>
    </header>
  );
}
