"use server";

import { createClient } from "@/lib/supabase/server";
import { sendSellerApprovedEmail, sendSellerRejectedEmail } from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") throw new Error("Unauthorized");
  return supabase;
}

export async function approveSeller(sellerId: string) {
  const supabase = await requireAdmin();

  // Get seller info for email
  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("user_id, full_name")
    .eq("id", sellerId)
    .single();

  const { error } = await supabase
    .from("seller_profiles")
    .update({ status: "approved", rejection_reason: null, updated_at: new Date().toISOString() })
    .eq("id", sellerId);

  if (error) throw new Error("承認に失敗しました: " + error.message);

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
}

export async function rejectSeller(sellerId: string, reason: string) {
  const supabase = await requireAdmin();

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

  if (error) throw new Error("却下に失敗しました: " + error.message);

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
}
