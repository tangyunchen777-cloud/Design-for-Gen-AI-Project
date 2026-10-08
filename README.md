# Humor Lab — Design for Gen AI

A Next.js, Supabase, Gemini, and Vercel app where members turn written prompts or uploaded Columbia/NYC photos into AI captions and vote on the funniest results.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and the server-only GEMINI_API_KEY in .env.local. Use the same values in Vercel. Never commit .env.local, Google client secrets, Gemini keys, or Supabase service-role keys.

## Supabase setup

Run migrations in order in SQL Editor:

1. supabase/migrations/202609240001_create_ai_tools.sql (the existing collection).
2. supabase/migrations/202610020001_profiles_and_avatars.sql (run once).
3. supabase/migrations/202610080001_generations_and_votes.sql (Assignment 4 tables and voting).
4. supabase/migrations/202610080002_optional_generation_images.sql (optional public post images).

The Assignment 4 migrations add `generations`, `votes`, and the optional `generation-images` Storage bucket. Prompts, captions, model names, and optional image paths are saved for each generation. RLS permits public post reads, restricts image uploads and generation inserts to the signed-in user's own folder/account, and allows only a voter to create/change/remove their own vote. `generation_vote_summary()` returns aggregate scores without exposing voter IDs.

The new migration creates public.profiles, with a UUID primary key referencing auth.users. Nullable names remain blank after signup so the user is prompted to fill them. An AFTER INSERT trigger creates the row automatically and existing accounts are backfilled. Users can select and update only their own profile. The app verifies users again in each protected page and server action.

Photos live in the private avatars Storage bucket. The database stores only the object path. Files are limited to 2 MB and JPG/PNG/WebP; server-side checks verify the file signature. Storage policies restrict access to the authenticated user's folder. The profile page uses a temporary signed URL to display the photo.

## Google OAuth setup

Create your own Google Cloud OAuth web client with basic Google identity scopes. Add this Google authorized redirect URI:

```text
https://ujidqnigsaglauhazrll.supabase.co/auth/v1/callback
```

Save the client ID and secret in Supabase → Authentication → Sign In / Providers → Google. The secret belongs only in Supabase, not in the Next.js environment or GitHub.

Supabase → Authentication → URL Configuration:

- Set Site URL to the production website.
- Allow http://localhost:3000/auth/callback for local development.
- Allow https://design-for-gen-ai-project.vercel.app/auth/callback.
- Add the exact final deployment URL followed by /auth/callback before submitting it.

The app's redirectTo is always `${window.location.origin}/auth/callback`, without custom query parameters. Supabase adds its authorization code automatically. The callback exchanges the code for a cookie-based session and sends the user to /profile. @supabase/ssr plus Next.js 16 proxy.ts keeps sessions refreshed without caching private responses.

Use Google's production audience setting so teachers can sign in. Request only openid, email, and profile identity scopes.

## Pages

- /: public collection from Supabase.
- /login: Google sign-in/signup.
- /auth/callback: OAuth code exchange.
- /profile: authenticated profile editor; prompts for missing names.
- /studio: requires authentication and completed names.

Navigation shows profile/studio/sign-out controls only when signed in. Direct requests to protected routes are also guarded on the server.

## Validation

```bash
pnpm lint
pnpm build
pnpm start
node scripts/check-public-routes.mjs http://localhost:3000
```

Run supabase/tests/profile_access.sql in SQL Editor to check the signup trigger and profile isolation. All test accounts and edits are rolled back.

Manual end-to-end check: sign in with Google, generate once from a written prompt and once from an uploaded JPG/PNG/WebP image, confirm both appear in the feed, cast and change a vote, then sign out and confirm the feed remains public while generation and voting require authentication. Open the exact deployment URL without a Vercel session to check public access.

## Deployment

Commit and push to the existing GitHub repository. Vercel deploys the connected branch automatically. Keep Deployment Protection disabled for the assignment, verify Google login using the exact deployment domain, and submit the unique deployment URL rather than the production alias.
