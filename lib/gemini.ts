import "server-only";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

export async function createCaption(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("AI captioning is not configured yet.");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "Write one original, concise, campus-friendly image caption. Be playful, not cruel. Never target protected traits, reveal private information, or explain the joke. Return only the caption, with no quotation marks." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.1, maxOutputTokens: 80 },
      }),
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as GeminiResponse;
  if (!response.ok) {
    console.error("Gemini request failed", response.status, payload.error?.message);
    throw new Error("The AI is taking a study break. Please try again shortly.");
  }
  const caption = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "").join("").trim()
    .replace(/^['\"]|['\"]$/g, "").slice(0, 280);
  if (!caption) throw new Error("The AI did not return a caption. Try a more specific scene.");
  return { caption, model: MODEL };
}
