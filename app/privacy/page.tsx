import Link from "next/link";

export default function PrivacyPage() {
  return <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-12">
    <Link href="/" className="text-sm font-semibold tracking-widest text-teal-800">← HUMOR LAB</Link>
    <h1 className="mt-12 text-4xl font-semibold tracking-tight">Privacy at Humor Lab</h1>
    <p className="mt-4 text-sm text-stone-500">Last updated October 8, 2026</p>
    <div className="mt-8 space-y-8 leading-7 text-stone-600">
      <section><h2 className="mb-3 text-xl font-semibold text-stone-800">A student project</h2><p>Humor Lab is a Design for Gen AI course project. Members can describe a campus or New York moment, generate an AI caption, and rate captions in the public feed.</p></section>
      <section><h2 className="mb-3 text-xl font-semibold text-stone-800">Information we use</h2><p>When you sign in, Google provides basic account information such as your email address, name, and profile picture. Supabase manages your sign-in account. We also store the first and last name you enter and any profile photo you choose to upload. We do not receive your Google password or request access to your Gmail, Drive, or other Google content.</p></section>
      <section><h2 className="mb-3 text-xl font-semibold text-stone-800">Where it goes</h2><p>Google handles identity verification, Supabase stores account and profile data, and Vercel hosts the website. These services may process technical request information under their own privacy policies. Profile photos are kept in a private Supabase Storage bucket. The app uses a temporary signed link to display your own photo.</p></section>
      <section><h2 className="mb-3 text-xl font-semibold text-stone-800">AI captions and votes</h2><p>The scene you enter is sent to Google’s Gemini API to create a caption. Supabase stores the scene, the full prompt, the resulting caption, the model name, and your account ID. Scenes and captions appear publicly, so do not enter private information. Votes are tied to accounts to prevent duplicate voting, but the public feed receives only totals—not voter identities.</p></section>
      <section><h2 className="mb-3 text-xl font-semibold text-stone-800">Sessions and your choices</h2><p>The app uses cookies to keep you signed in. You can sign out from the navigation, edit your names, or replace your uploaded photo on the profile page. Profile information remains stored after signing out. For account deletion or privacy questions, contact the project owner through the support email displayed on the Google sign-in screen.</p></section>
    </div>
  </main>;
}
