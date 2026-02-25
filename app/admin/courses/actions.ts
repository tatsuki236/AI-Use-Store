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

export async function createCourse(formData: FormData) {
  const supabase = await requireAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;

  const { data, error } = await supabase
    .from("courses")
    .insert({ title, description, price, thumbnail_url })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/admin/courses/${data.id}/lessons`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string) || 0;
  const thumbnail_url = (formData.get("thumbnail_url") as string) || null;

  const { error } = await supabase
    .from("courses")
    .update({ title, description, price, thumbnail_url })
    .eq("id", courseId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
  redirect("/admin/courses");
}

export async function deleteCourse(courseId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/courses");
}

export async function createLesson(courseId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const video_url = (formData.get("video_url") as string) || null;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase
    .from("lessons")
    .insert({ course_id: courseId, title, content, video_url, sort_order });

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons`);
}

export async function updateLesson(lessonId: string, courseId: string, formData: FormData) {
  const supabase = await requireAdmin();
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const video_url = (formData.get("video_url") as string) || null;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase
    .from("lessons")
    .update({ title, content, video_url, sort_order })
    .eq("id", lessonId);

  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons`);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/courses/${courseId}/lessons`);
}
