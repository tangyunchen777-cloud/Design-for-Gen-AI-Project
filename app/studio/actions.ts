"use server";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createCaption } from "@/lib/gemini";
import { isProfileComplete, requireProfile } from "@/lib/profile";

export type CaptionPreview = {
  caption: string;
  token: string;
  style: "witty" | "deadpan" | "absurd";
  hasImage: boolean;
};
export type PreviewState = { error?: string; preview?: CaptionPreview };
export type PublishState = { error?: string; success?: string };
export type VoteState = { error?: string };
const styles = new Set<CaptionPreview["style"]>(["witty", "deadpan", "absurd"]);
const previewLifetime = 15 * 60 * 1000;

type ImageFormat = { extension: "jpg" | "png" | "webp"; mimeType: "image/jpeg" | "image/png" | "image/webp" };
type GenerationInput = {
  scene: string;
  storedScene: string;
  style: CaptionPreview["style"];
  prompt: string;
  imageBytes: Uint8Array | null;
  imageFormat: ImageFormat | null;
  imageHash: string | null;
};
type PreviewPayload = {
  version: 1;
  userId: string;
  caption: string;
  model: string;
  scene: string;
  style: CaptionPreview["style"];
  prompt: string;
  imageHash: string | null;
  issuedAt: number;
};

function detectImage(bytes: Uint8Array): ImageFormat | null {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  const decoder = new TextDecoder();
  const webp = decoder.decode(bytes.slice(0, 4)) === "RIFF" && decoder.decode(bytes.slice(8, 12)) === "WEBP";
  if (jpeg) return { extension: "jpg", mimeType: "image/jpeg" as const };
  if (png) return { extension: "png", mimeType: "image/png" as const };
  if (webp) return { extension: "webp", mimeType: "image/webp" as const };
  return null;
}

async function parseGenerationInput(formData: FormData): Promise<{ error: string } | { input: GenerationInput }> {
  const mode = String(formData.get("mode") ?? "photo");
  const scene = String(formData.get("scene") ?? "").trim().replace(/\s+/g, " ");
  const styleValue = String(formData.get("style") ?? "");
  const style = styles.has(styleValue as CaptionPreview["style"]) ? styleValue as CaptionPreview["style"] : null;
  const imageEntry = formData.get("image");
  const hasImage = mode === "photo" && imageEntry instanceof File && imageEntry.size > 0;
  if (!new Set(["photo", "prompt"]).has(mode)) return { error: "Choose photo or written scene mode." };
  if (mode === "photo" && !hasImage) return { error: "Add a photo before crafting the caption." };
  if (mode === "prompt" && (scene.length < 12 || scene.length > 500)) return { error: "Describe the moment in 12–500 characters." };
  if (hasImage && scene.length > 500) return { error: "Keep the optional image direction under 500 characters." };
  if (!style) return { error: "Choose one of the available humor vibes." };

  let imageBytes: Uint8Array | null = null;
  let imageFormat: ImageFormat | null = null;
  if (hasImage) {
    if (imageEntry.size > 4 * 1024 * 1024) return { error: "Choose an image smaller than 4 MB." };
    imageBytes = new Uint8Array(await imageEntry.arrayBuffer());
    imageFormat = detectImage(imageBytes);
    if (!imageFormat) return { error: "Choose a real JPG, PNG, or WebP image." };
  }

  const storedScene = scene || "Uploaded image with no additional direction.";
  const prompt = [
    hasImage
      ? `Creator direction: ${scene || "No extra direction; rely on the uploaded image."}`
      : `Scene that would appear in an image: ${scene}`,
    `Humor style: ${style}`,
    "Audience: college students who love Columbia campus and New York City culture.",
    "Write one punchy caption under 140 characters.",
  ].join("\n");

  return { input: {
    scene,
    storedScene,
    style,
    prompt,
    imageBytes,
    imageFormat,
    imageHash: imageBytes ? createHash("sha256").update(imageBytes).digest("hex") : null,
  } };
}

function previewSecret() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Caption generation is not configured yet.");
  return `${key}:humor-lab-preview-v1`;
}

function signPreview(payload: PreviewPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", previewSecret()).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function verifyPreview(token: string, userId: string): PreviewPayload | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, signature] = parts;
  const supplied = Buffer.from(signature, "base64url");
  const expected = createHmac("sha256", previewSecret()).update(body).digest();
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as PreviewPayload;
    if (payload.version !== 1 || payload.userId !== userId || !styles.has(payload.style)) return null;
    if (!Number.isFinite(payload.issuedAt) || typeof payload.model !== "string" || typeof payload.scene !== "string") return null;
    if (Date.now() - payload.issuedAt > previewLifetime || payload.issuedAt > Date.now() + 30_000) return null;
    if (!payload.caption || payload.caption.length > 280 || !payload.prompt || payload.prompt.length > 2_000) return null;
    return payload;
  } catch {
    return null;
  }
}

async function reachedHourlyLimit(supabase: Awaited<ReturnType<typeof requireProfile>>["supabase"]) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: recentCount } = await supabase.rpc("my_generation_count_since", { since_time: oneHourAgo });
  return Number(recentCount ?? 0) >= 8;
}

export async function previewCaption(formData: FormData): Promise<PreviewState> {
  const { supabase, user, profile } = await requireProfile();
  if (!isProfileComplete(profile)) return { error: "Complete your profile before generating." };

  const parsed = await parseGenerationInput(formData);
  if ("error" in parsed) return parsed;
  if (await reachedHourlyLimit(supabase)) return { error: "You’ve reached the hourly limit. Come back with fresh material soon." };
  const { input } = parsed;

  try {
    const image = input.imageBytes && input.imageFormat ? {
      base64: Buffer.from(input.imageBytes).toString("base64"),
      mimeType: input.imageFormat.mimeType,
    } : undefined;
    const { caption, model } = await createCaption(input.prompt, image);
    const token = signPreview({
      version: 1,
      userId: user.id,
      caption,
      model,
      scene: input.storedScene,
      style: input.style,
      prompt: input.prompt,
      imageHash: input.imageHash,
      issuedAt: Date.now(),
    });
    return { preview: { caption, token, style: input.style, hasImage: Boolean(input.imageBytes) } };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Caption generation failed." };
  }
}

export async function publishCaption(token: string, formData: FormData): Promise<PublishState> {
  const { supabase, user, profile } = await requireProfile();
  if (!isProfileComplete(profile)) return { error: "Complete your profile before publishing." };
  const payload = verifyPreview(token, user.id);
  if (!payload) return { error: "That preview expired or is not valid. Craft a fresh caption." };

  const parsed = await parseGenerationInput(formData);
  if ("error" in parsed) return parsed;
  const { input } = parsed;
  if (payload.scene !== input.storedScene || payload.style !== input.style || payload.prompt !== input.prompt || payload.imageHash !== input.imageHash) {
    return { error: "Your photo, scene, or vibe changed. Craft a fresh preview before publishing." };
  }
  if (await reachedHourlyLimit(supabase)) return { error: "You’ve reached the hourly limit. Come back with fresh material soon." };

  try {
    let imagePath: string | null = null;
    if (input.imageBytes && input.imageFormat) {
      imagePath = `${user.id}/${crypto.randomUUID()}.${input.imageFormat.extension}`;
      const { error: uploadError } = await supabase.storage.from("generation-images")
        .upload(imagePath, input.imageBytes, { contentType: input.imageFormat.mimeType, upsert: false });
      if (uploadError) {
        console.error("Generation image upload failed", uploadError.message);
        return { error: "The image could not be published. Please try again." };
      }
    }

    const { error } = await supabase.from("generations").insert({
      creator_id: user.id,
      scene: payload.scene,
      style: payload.style,
      prompt: payload.prompt,
      caption: payload.caption,
      model: payload.model,
      image_path: imagePath,
    });
    if (error) {
      console.error("Generation insert failed", error.message);
      if (imagePath) await supabase.storage.from("generation-images").remove([imagePath]);
      return { error: "Your caption could not be published. Please try again." };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Caption publishing failed." };
  }

  revalidatePath("/studio");
  revalidatePath("/feed");
  return { success: "Published to Humors." };
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
