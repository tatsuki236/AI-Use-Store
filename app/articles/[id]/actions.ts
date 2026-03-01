"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(
  articleId: string,
  rating: number,
  comment: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  if (rating < 1 || rating > 5) throw new Error("評価は1〜5で選択してください");

  // Check article exists and user has access (free or purchased)
  const { data: article } = await supabase
    .from("articles")
    .select("id, is_free")
    .eq("id", articleId)
    .eq("published", true)
    .single();

  if (!article) throw new Error("記事が見つかりません");

  if (!article.is_free) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("status")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .eq("status", "completed")
      .single();

    if (!purchase) throw new Error("この記事を購入してからレビューできます");
  }

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: user.id,
      article_id: articleId,
      rating,
      comment: comment.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,article_id" }
  );

  if (error) throw new Error(error.message);

  revalidatePath(`/articles/${articleId}`);
  revalidatePath("/");
}

export async function deleteReview(articleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("user_id", user.id)
    .eq("article_id", articleId);

  if (error) throw new Error(error.message);

  revalidatePath(`/articles/${articleId}`);
  revalidatePath("/");
}
