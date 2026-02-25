"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approvePurchase(purchaseId: string, userId: string) {
  const supabase = await createClient();

  // Verify the current user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    throw new Error("Unauthorized");
  }

  // Update purchase status to completed
  const { error: purchaseError } = await supabase
    .from("purchases")
    .update({ status: "completed" })
    .eq("id", purchaseId);

  if (purchaseError) throw new Error(purchaseError.message);

  // Update user profile to approved
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_approved: true })
    .eq("id", userId);

  if (profileError) throw new Error(profileError.message);

  revalidatePath("/admin");
}
