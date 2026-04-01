"use server";

import { createClient } from "@/lib/supabase/server";

export async function approveSeller(
  sellerId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("seller_profiles")
    .update({ status: "approved", rejection_reason: null, updated_at: new Date().toISOString() })
    .eq("id", sellerId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function rejectSeller(
  sellerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("seller_profiles")
    .update({ status: "rejected", rejection_reason: reason, updated_at: new Date().toISOString() })
    .eq("id", sellerId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
