"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function purchaseArticle(articleId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("ログインが必要です");

  const { error } = await supabase.from("purchases").insert({
    user_id: user.id,
    article_id: articleId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("既にこの教材を購入済みです");
    }
    throw new Error(error.message);
  }

  revalidatePath(`/articles/${articleId}`);
}
