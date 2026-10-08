import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Generation = {
  id: string;
  scene: string;
  style: "witty" | "deadpan" | "absurd";
  caption: string;
  model: string;
  image_url: string | null;
  created_at: string;
  upvotes: number;
  downvotes: number;
  score: number;
  my_vote: -1 | 1 | null;
};

type VoteSummary = {
  generation_id: string;
  upvotes: number;
  downvotes: number;
  score: number;
  my_vote: -1 | 1 | null;
};

export async function getGenerations(limit = 30): Promise<Generation[]> {
  const supabase = await createClient();
  const [{ data: rows, error }, { data: summaries, error: summaryError }] = await Promise.all([
    supabase.from("generations")
      .select("id, scene, style, caption, model, image_path, created_at")
      .order("created_at", { ascending: false }).limit(limit),
    supabase.rpc("generation_vote_summary"),
  ]);

  if (error || summaryError) throw new Error("The caption feed could not be loaded. Please try again.");
  const voteByGeneration = new Map(
    ((summaries ?? []) as VoteSummary[]).map((summary) => [summary.generation_id, summary]),
  );

  return (rows ?? []).map((row) => {
    const votes = voteByGeneration.get(row.id);
    const imageUrl = row.image_path
      ? supabase.storage.from("generation-images").getPublicUrl(row.image_path).data.publicUrl
      : null;
    return {
      ...row,
      image_url: imageUrl,
      upvotes: Number(votes?.upvotes ?? 0),
      downvotes: Number(votes?.downvotes ?? 0),
      score: Number(votes?.score ?? 0),
      my_vote: votes?.my_vote ?? null,
    } as Generation;
  });
}
