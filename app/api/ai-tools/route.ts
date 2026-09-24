import { getAiTools } from "@/lib/ai-tools";

export async function GET() {
  try {
    return Response.json({ data: await getAiTools() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("AI tools query failed:", error);
    return Response.json({ error: "Unable to load AI tools." }, { status: 500 });
  }
}
