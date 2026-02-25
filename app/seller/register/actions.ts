"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

export async function registerSeller(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const full_name = formData.get("full_name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const date_of_birth = formData.get("date_of_birth") as string;

  const { error } = await supabase.from("seller_profiles").insert({
    user_id: user.id,
    full_name,
    address,
    phone,
    date_of_birth,
    status: "pending",
  });

  if (error) throw new Error("登録に失敗しました: " + error.message);

  revalidatePath("/seller/register");
  redirect("/seller/register");
}

export async function updateSellerRegistration(formData: FormData) {
  const { supabase, user } = await requireAuth();

  const full_name = formData.get("full_name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const date_of_birth = formData.get("date_of_birth") as string;

  const { error } = await supabase
    .from("seller_profiles")
    .update({
      full_name,
      address,
      phone,
      date_of_birth,
      status: "pending",
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) throw new Error("更新に失敗しました: " + error.message);

  revalidatePath("/seller/register");
  redirect("/seller/register");
}
