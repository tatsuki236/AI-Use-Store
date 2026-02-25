"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (!profile || profile.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

export async function createArticle(formData: FormData) {
  const supabase = await requireAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const rating = parseFloat(formData.get("rating") as string) || 0;
  const is_free = formData.get("is_free") === "on";
  const published = formData.get("published") === "on";
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;

  const status = published ? "published" : "draft";
  const { error } = await supabase
    .from("articles")
    .insert({ title, content, price: is_free ? 0 : price, rating, is_free, published, thumbnail_url, status });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function updateArticle(articleId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const rating = parseFloat(formData.get("rating") as string) || 0;
  const is_free = formData.get("is_free") === "on";
  const published = formData.get("published") === "on";
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;

  const status = published ? "published" : "draft";
  const { error } = await supabase
    .from("articles")
    .update({ title, content, price: is_free ? 0 : price, rating, is_free, published, thumbnail_url, status })
    .eq("id", articleId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticle(articleId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("articles").delete().eq("id", articleId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/articles");
}
