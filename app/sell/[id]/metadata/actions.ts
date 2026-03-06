"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requirePublishedArticleOwner(articleId: string) {
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

  if (article.status !== "published") {
    throw new Error("公開中の記事のみ編集できます");
  }

  return { supabase, user };
}

export async function updateArticleMetadata(
  articleId: string,
  formData: FormData
) {
  const { supabase } = await requirePublishedArticleOwner(articleId);

  const title = formData.get("title") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const is_free = formData.get("is_free") === "on";
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;

  if (!title || title.trim().length === 0) {
    throw new Error("タイトルは必須です");
  }

  const { error } = await supabase
    .from("articles")
    .update({
      title: title.trim(),
      price: is_free ? 0 : price,
      is_free,
      thumbnail_url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error)
    throw new Error("メタ情報の更新に失敗しました: " + error.message);

  revalidatePath("/sell");
  revalidatePath(`/articles/${articleId}`);
  redirect("/sell");
}

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

  if (article.status !== "published") {
    throw new Error("公開中の記事のみ取り下げできます");
  }

  const { error } = await supabase
    .from("articles")
    .update({
      status: "draft",
      published: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (error) throw new Error("取り下げに失敗しました: " + error.message);

  revalidatePath("/sell");
  revalidatePath(`/articles/${articleId}`);
  redirect("/sell");
}
