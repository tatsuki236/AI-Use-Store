"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categorizeArticle } from "@/lib/categorize";

async function requireApprovedSeller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (!seller || seller.status !== "approved") {
    throw new Error("出品者として承認されていません");
  }

  return { supabase, user };
}

export async function createUserArticle(formData: FormData) {
  const { supabase, user } = await requireApprovedSeller();

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const is_free = formData.get("is_free") === "on";
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;
  const action = formData.get("action") as string;

  const status = action === "submit" ? "pending_review" : "draft";
  const category = await categorizeArticle(title, content);

  const { error } = await supabase.from("articles").insert({
    title,
    content,
    price: is_free ? 0 : price,
    is_free,
    published: false,
    thumbnail_url,
    author_id: user.id,
    status,
    rating: 0,
    category,
  });

  if (error) throw new Error("記事の作成に失敗しました: " + error.message);

  revalidatePath("/sell");
  redirect("/sell");
}
