import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { isProfileComplete, requireProfile } from "@/lib/profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireProfile();
  const complete = isProfileComplete(profile);
  let avatarUrl: string | undefined;
  if (profile.avatar_path) {
    const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_path, 3600);
    avatarUrl = data?.signedUrl;
  }
  return <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-12">
    <SiteHeader />
    <section className="mx-auto my-14 max-w-2xl">
      <p className="text-sm font-medium uppercase tracking-widest text-teal-800">Your corner of Humor Lab</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{complete ? "My profile." : "First, a proper introduction."}</h1>
      <p className="mt-5 leading-7 text-stone-600">{complete ? "Update your name or give your profile a fresh face." : "Welcome! Please add your first and last name to unlock the members’ studio."}</p>
      {!complete && <p role="status" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Both names are required to complete your profile.</p>}
      <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-8 flex items-center gap-5 border-b border-stone-200 pb-7">
          {avatarUrl ? (
            // Signed private Storage URLs are already scoped to the current user.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="Your profile photo" className="h-20 w-20 rounded-full object-cover" />
          ) : <div aria-label="No profile photo yet" className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-teal-50 text-2xl font-medium text-teal-900">{profile.first_name?.slice(0, 1).toUpperCase() || "?"}</div>}
          <div className="min-w-0"><p className="font-medium">{complete ? `${profile.first_name} ${profile.last_name}` : "Your profile"}</p><p className="mt-1 break-all text-sm text-stone-500">{user.email}</p><span className="mt-2 inline-block rounded-full bg-stone-100 px-3 py-1 text-xs">Google account</span></div>
        </div>
        <ProfileForm profile={profile} />
      </div>
      {complete && <Link href="/studio" className="mt-6 inline-block text-sm font-medium text-teal-800 hover:underline">Enter the members’ studio →</Link>}
    </section>
  </main>;
}
