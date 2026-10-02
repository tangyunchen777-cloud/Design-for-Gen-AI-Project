import assert from "node:assert/strict";

const base = process.argv[2] || "http://localhost:3003";
for (const path of ["/profile", "/studio"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 307, `${path} must redirect without a session`);
  assert.equal(new URL(response.headers.get("location"), base).pathname, "/login");
  assert.match(response.headers.get("cache-control"), /no-store/);
  console.log(`PASS ${path} requires sign-in`);
}
const callback = await fetch(new URL("/auth/callback", base), { redirect: "manual" });
assert.equal(callback.status, 307);
assert.equal(new URL(callback.headers.get("location"), base).pathname, "/login");
console.log("PASS callback without a code fails safely");
for (const path of ["/", "/login"]) {
  const response = await fetch(new URL(path, base));
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes(path === "/" ? "Every picture has a funny side." : "Continue with Google"));
  console.log(`PASS ${path} is public`);
}
const collection = await fetch(new URL("/api/ai-tools", base));
assert.equal(collection.status, 200);
assert.ok(Array.isArray((await collection.json()).data));
console.log("PASS existing Supabase collection remains available");
