const allowedDestinations = new Set(["/studio", "/feed"]);

export function safeReturnPath(value: unknown, fallback = "/studio") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://humor-lab.local");
    if (url.origin !== "https://humor-lab.local" || !allowedDestinations.has(url.pathname)) return fallback;
    return `${url.pathname}${url.search}`;
  } catch {
    return fallback;
  }
}
