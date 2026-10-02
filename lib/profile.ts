import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_path: string | null;
};

export function isProfileComplete(profile: Profile) {
  return Boolean(profile.first_name?.trim() && profile.last_name?.trim());
}

export async function requireProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await supabase.from("profiles")
    .select("id, first_name, last_name, avatar_path").eq("id", user.id).single();
  if (error || !profile) throw new Error("Your profile could not be loaded. Please try again.");
  return { supabase, user, profile: profile as Profile };
}
