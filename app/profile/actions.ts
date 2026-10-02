"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; success?: string };

export async function saveProfile(_previous: ProfileState, formData: FormData): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in before saving your profile." };
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  if (!firstName || !lastName || firstName.length > 80 || lastName.length > 80) {
    return { error: "Enter both names, using no more than 80 characters for each." };
  }
  const { data: profile, error: loadError } = await supabase.from("profiles")
    .select("avatar_path").eq("id", user.id).single();
  if (loadError || !profile) return { error: "Could not load your profile. Please try again." };

  let avatarPath: string | null = profile.avatar_path;
  let newPath: string | null = null;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    if (file.size > 2 * 1024 * 1024) return { error: "Choose a photo smaller than 2 MB." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const png = [137, 80, 78, 71, 13, 10, 26, 10].every((value, i) => bytes[i] === value);
    const webp = new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    const format = jpeg ? ["jpg", "image/jpeg"] : png ? ["png", "image/png"] : webp ? ["webp", "image/webp"] : null;
    if (!format) return { error: "Choose a JPG, PNG, or WebP photo." };
    newPath = `${user.id}/${crypto.randomUUID()}.${format[0]}`;
    const { error } = await supabase.storage.from("avatars").upload(newPath, bytes, { contentType: format[1], upsert: false });
    if (error) return { error: "Your photo could not be uploaded. Please try again." };
    avatarPath = newPath;
  }

  const { data: updated, error } = await supabase.from("profiles").update({
    first_name: firstName, last_name: lastName, avatar_path: avatarPath,
  }).eq("id", user.id).select("id").single();
  if (error || !updated) {
    if (newPath) await supabase.storage.from("avatars").remove([newPath]);
    return { error: "Your profile could not be saved. Please try again." };
  }
  if (newPath && profile.avatar_path) await supabase.storage.from("avatars").remove([profile.avatar_path]);
  revalidatePath("/profile");
  revalidatePath("/studio");
  return { success: "Profile saved. You’re ready for the studio!" };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error("Could not sign out. Please try again.");
  redirect("/");
}
