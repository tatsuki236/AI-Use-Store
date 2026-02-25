"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireArticleOwner(articleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: article } = await supabase
    .from("articles")
    .select("id, author_id, status")
    .eq("id", articleId)
    .single();

  if (!article || article.author_id !== user.id) {
    throw new Error("この記事を編集する権限がありません");
  }

  if (article.status !== "draft" && article.status !== "rejected") {
    throw new Error("この記事は編集できません");
  }

  return { supabase, user };
}

export async function updateUserArticle(articleId: string, formData: FormData) {
  const { supabase } = await requireArticleOwner(articleId);

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const is_free = formData.get("is_free") === "on";
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;
  const action = formData.get("action") as string;

  const status = action === "submit" ? "pending_review" : "draft";

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      content,
      price: is_free ? 0 : price,
      is_free,
      thumbnail_url,
      status,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) throw new Error("記事の更新に失敗しました: " + error.message);

  revalidatePath("/sell");
  redirect("/sell");
}
