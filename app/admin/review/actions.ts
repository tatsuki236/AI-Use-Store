"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

export async function approveArticle(articleId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("articles")
    .update({
      status: "published",
      published: true,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) throw new Error("承認に失敗しました: " + error.message);

  revalidatePath("/admin/review");
  revalidatePath("/");
}

export async function rejectArticle(articleId: string, reason: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("articles")
    .update({
      status: "rejected",
      published: false,
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) throw new Error("却下に失敗しました: " + error.message);

  revalidatePath("/admin/review");
}
