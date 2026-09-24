"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-xl px-6 py-24">
      <h1 className="text-3xl font-semibold">We couldn’t load the collection.</h1>
      <p className="mt-4 text-stone-600">Please try again in a moment.</p>
      <button onClick={reset} className="mt-6 rounded-full bg-teal-900 px-6 py-3 text-white focus-visible:outline-2 focus-visible:outline-offset-4">Try again</button>
    </main>
  );
}
