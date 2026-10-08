"use server";

import { revalidatePath } from "next/cache";
import { createCaption } from "@/lib/gemini";
import { isProfileComplete, requireProfile } from "@/lib/profile";

export type GenerationState = { error?: string; success?: string };
export type VoteState = { error?: string };
const styles = new Set(["witty", "deadpan", "absurd"]);

export async function generateCaption(
  _previous: GenerationState,
  formData: FormData,
): Promise<GenerationState> {
  const { supabase, user, profile } = await requireProfile();
  if (!isProfileComplete(profile)) return { error: "Complete your profile before generating." };

  const scene = String(formData.get("scene") ?? "").trim().replace(/\s+/g, " ");
  const style = String(formData.get("style") ?? "");
  if (scene.length < 12 || scene.length > 500) return { error: "Describe the moment in 12–500 characters." };
  if (!styles.has(style)) return { error: "Choose one of the available humor styles." };

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentCount } = await supabase.rpc("my_generation_count_since", { since_time: oneHourAgo });
  if (Number(recentCount ?? 0) >= 8) return { error: "You’ve reached the hourly limit. Come back with fresh material soon." };

  const prompt = [
    `Scene that would appear in an image: ${scene}`,
    `Humor style: ${style}`,
    "Audience: college students who love Columbia campus and New York City culture.",
    "Write one punchy caption under 140 characters.",
  ].join("\n");

  try {
    const { caption, model } = await createCaption(prompt);
    const { error } = await supabase.from("generations").insert({ creator_id: user.id, scene, style, prompt, caption, model });
    if (error) {
      console.error("Generation insert failed", error.message);
      return { error: "Your caption was generated but could not be saved. Please try again." };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Caption generation failed." };
  }

  revalidatePath("/studio");
  revalidatePath("/feed");
  return { success: "Caption generated and published to today’s battle." };
}

export async function voteForGeneration(
  generationId: string,
  value: -1 | 1,
  _previous: VoteState,
): Promise<VoteState> {
  void _previous;
  const { supabase, user } = await requireProfile();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(generationId) || ![-1, 1].includes(value)) return { error: "That vote is not valid." };

  const { data: generation } = await supabase.from("generations").select("id").eq("id", generationId).single();
  if (!generation) return { error: "That caption no longer exists." };
  const { data: existing } = await supabase.from("votes").select("value")
    .eq("generation_id", generationId).eq("user_id", user.id).maybeSingle();

  const mutation = existing?.value === value
    ? supabase.from("votes").delete().eq("generation_id", generationId).eq("user_id", user.id)
    : supabase.rpc("cast_vote", { target_generation_id: generationId, new_value: value });
  const { error } = await mutation;
  if (error) {
    console.error("Vote mutation failed", error.message);
    return { error: "Your vote could not be saved. Please try again." };
  }
  revalidatePath("/feed");
  revalidatePath("/studio");
  return {};
}
