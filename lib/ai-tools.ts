import { createSupabaseClient } from "./supabase";

export type AiTool = {
  id: number;
  name: string;
  category: string;
  description: string;
  created_at: string;
};

export async function getAiTools(): Promise<AiTool[]> {
  const { data, error } = await createSupabaseClient()
    .from("ai_tools")
    .select("id, name, category, description, created_at")
    .order("id", { ascending: true });

  if (error) throw new Error(`Unable to read AI tools: ${error.message}`);
  return data;
}
