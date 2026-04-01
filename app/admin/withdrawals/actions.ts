"use server";

import { createClient } from "@/lib/supabase/server";

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

export async function approveWithdrawal(withdrawalId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "approved",
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", withdrawalId);

  if (error) throw new Error("承認に失敗しました: " + error.message);
}

export async function completeWithdrawal(withdrawalId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", withdrawalId);

  if (error) throw new Error("完了処理に失敗しました: " + error.message);
}

export async function rejectWithdrawal(withdrawalId: string, reason: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from("withdrawal_requests")
    .update({
      status: "rejected",
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", withdrawalId);

  if (error) throw new Error("却下に失敗しました: " + error.message);
}
