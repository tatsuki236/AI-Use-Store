"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function withdrawArticle(articleId: string) {
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
    throw new Error("この記事を操作する権限がありません");
  }

  if (article.status !== "pending_review") {
    throw new Error("審査中の記事のみ取り下げできます");
  }

  const { error } = await supabase
    .from("articles")
    .update({ status: "draft", published: false })
    .eq("id", articleId);

  if (error) throw new Error("取り下げに失敗しました: " + error.message);

  revalidatePath("/sell");
}

export async function deleteArticle(articleId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: article } = await supabase
    .from("articles")
    .select("id, author_id")
    .eq("id", articleId)
    .single();

  if (!article || article.author_id !== user.id) {
    throw new Error("この記事を操作する権限がありません");
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId);

  if (error) throw new Error("削除に失敗しました: " + error.message);

  revalidatePath("/sell");
}
