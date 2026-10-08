import "server-only";

const MODELS = (process.env.GEMINI_MODELS || process.env.GEMINI_MODEL || [
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-flash-lite",
  "gemma-4-26b-a4b-it",
].join(","))
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function createCaption(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI captioning is not configured yet.");

  const instruction = [
    "Write one original, concise, campus-friendly image caption.",
    "Be playful, not cruel. Never target protected traits, reveal private information, or explain the joke.",
    "Return only the caption, with no quotation marks.",
    prompt,
  ].join("\n");

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: instruction }] }],
            generationConfig: { temperature: 1.1, maxOutputTokens: 80 },
          }),
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as GeminiResponse;
      if (response.ok) {
        const caption = payload.candidates?.[0]?.content?.parts
          ?.map((part) => part.text ?? "").join("").trim()
          .replace(/^['\"]|['\"]$/g, "").slice(0, 280);
        if (caption) return { caption, model };
      }

      console.error("Gemini request failed", model, response.status, payload.error?.message);
      if (attempt === 0 && (response.status === 429 || response.status >= 500)) {
        await sleep(650);
      } else {
        break;
      }
    }
  }

  throw new Error("The AI is taking a study break. Please try again shortly.");
}
