"use server";

import { createClient } from "@/lib/supabase/server";
import { sendSellerApprovedEmail, sendSellerRejectedEmail } from "@/lib/email";

async function getAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Unauthorized" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin")
    return { supabase: null, error: "Unauthorized" };
  return { supabase, error: null };
}

export async function approveSeller(
  sellerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, error: authError } = await getAdminClient();
    if (!supabase) return { success: false, error: authError ?? "Unauthorized" };

    // Get seller info for email
    const { data: seller } = await supabase
      .from("seller_profiles")
      .select("user_id, full_name")
      .eq("id", sellerId)
      .single();

    const { error } = await supabase
      .from("seller_profiles")
      .update({
        status: "approved",
        rejection_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sellerId);

    if (error) return { success: false, error: "承認に失敗しました: " + error.message };

    // Send approval email
    if (seller) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", seller.user_id)
        .single();

      if (profile?.email) {
        try {
          await sendSellerApprovedEmail(profile.email, seller.full_name);
        } catch (e) {
          console.error("Failed to send approval email:", e);
        }
      }
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "予期しないエラーが発生しました",
    };
  }
}

export async function rejectSeller(
  sellerId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, error: authError } = await getAdminClient();
    if (!supabase) return { success: false, error: authError ?? "Unauthorized" };

    // Get seller info for email
    const { data: seller } = await supabase
      .from("seller_profiles")
      .select("user_id, full_name")
      .eq("id", sellerId)
      .single();

    const { error } = await supabase
      .from("seller_profiles")
      .update({
        status: "rejected",
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sellerId);

    if (error) return { success: false, error: "却下に失敗しました: " + error.message };

    // Send rejection email
    if (seller) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", seller.user_id)
        .single();

      if (profile?.email) {
        try {
          await sendSellerRejectedEmail(profile.email, seller.full_name, reason);
        } catch (e) {
          console.error("Failed to send rejection email:", e);
        }
      }
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "予期しないエラーが発生しました",
    };
  }
}
