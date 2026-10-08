"use server";

import { revalidatePath } from "next/cache";
import { createCaption } from "@/lib/gemini";
import { isProfileComplete, requireProfile } from "@/lib/profile";

export type GenerationState = { error?: string; success?: string };
export type VoteState = { error?: string };
const styles = new Set(["witty", "deadpan", "absurd"]);

function detectImage(bytes: Uint8Array) {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  const decoder = new TextDecoder();
  const webp = decoder.decode(bytes.slice(0, 4)) === "RIFF" && decoder.decode(bytes.slice(8, 12)) === "WEBP";
  if (jpeg) return { extension: "jpg", mimeType: "image/jpeg" as const };
  if (png) return { extension: "png", mimeType: "image/png" as const };
  if (webp) return { extension: "webp", mimeType: "image/webp" as const };
  return null;
}

export async function generateCaption(
  _previous: GenerationState,
  formData: FormData,
): Promise<GenerationState> {
  const { supabase, user, profile } = await requireProfile();
  if (!isProfileComplete(profile)) return { error: "Complete your profile before generating." };

  const scene = String(formData.get("scene") ?? "").trim().replace(/\s+/g, " ");
  const style = String(formData.get("style") ?? "");
  const imageEntry = formData.get("image");
  const hasImage = imageEntry instanceof File && imageEntry.size > 0;
  if (!hasImage && (scene.length < 12 || scene.length > 500)) return { error: "Describe the moment in 12–500 characters, or upload an image." };
  if (hasImage && scene.length > 500) return { error: "Keep the optional image direction under 500 characters." };
  if (!styles.has(style)) return { error: "Choose one of the available humor styles." };

  let imageBytes: Uint8Array | null = null;
  let imageFormat: ReturnType<typeof detectImage> = null;
  if (hasImage) {
    if (imageEntry.size > 4 * 1024 * 1024) return { error: "Choose an image smaller than 4 MB." };
    imageBytes = new Uint8Array(await imageEntry.arrayBuffer());
    imageFormat = detectImage(imageBytes);
    if (!imageFormat) return { error: "Choose a real JPG, PNG, or WebP image." };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentCount } = await supabase.rpc("my_generation_count_since", { since_time: oneHourAgo });
  if (Number(recentCount ?? 0) >= 8) return { error: "You’ve reached the hourly limit. Come back with fresh material soon." };

  const prompt = [
    hasImage
      ? `Creator direction: ${scene || "No extra direction; rely on the uploaded image."}`
      : `Scene that would appear in an image: ${scene}`,
    `Humor style: ${style}`,
    "Audience: college students who love Columbia campus and New York City culture.",
    "Write one punchy caption under 140 characters.",
  ].join("\n");

  try {
    const image = imageBytes && imageFormat ? {
      base64: Buffer.from(imageBytes).toString("base64"),
      mimeType: imageFormat.mimeType,
    } : undefined;
    const { caption, model } = await createCaption(prompt, image);

    let imagePath: string | null = null;
    if (imageBytes && imageFormat) {
      imagePath = `${user.id}/${crypto.randomUUID()}.${imageFormat.extension}`;
      const { error: uploadError } = await supabase.storage.from("generation-images")
        .upload(imagePath, imageBytes, { contentType: imageFormat.mimeType, upsert: false });
      if (uploadError) {
        console.error("Generation image upload failed", uploadError.message);
        return { error: "Your caption was generated, but the image could not be published. Please try again." };
      }
    }

    const storedScene = scene || "Uploaded image with no additional direction.";
    const { error } = await supabase.from("generations").insert({
      creator_id: user.id,
      scene: storedScene,
      style,
      prompt,
      caption,
      model,
      image_path: imagePath,
    });
    if (error) {
      console.error("Generation insert failed", error.message);
      if (imagePath) await supabase.storage.from("generation-images").remove([imagePath]);
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
