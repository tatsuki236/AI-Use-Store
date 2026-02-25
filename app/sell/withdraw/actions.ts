"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireApprovedSeller() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!seller || seller.status !== "approved") {
    throw new Error("出品者として承認されていません");
  }

  return { supabase, user, seller };
}

export async function requestWithdrawal(formData: FormData) {
  const { supabase, user, seller } = await requireApprovedSeller();

  const amount = parseInt(formData.get("amount") as string) || 0;
  if (amount <= 0) throw new Error("出金額を正しく入力してください");

  const bank_name = formData.get("bank_name") as string;
  const branch_name = formData.get("branch_name") as string;
  const account_number = formData.get("account_number") as string;
  const account_holder_name = formData.get("account_holder_name") as string;

  // Upload ID document if provided
  const idFile = formData.get("id_document") as File;
  let id_document_url: string | null = null;

  if (idFile && idFile.size > 0) {
    const ext = idFile.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("id-documents")
      .upload(filePath, idFile);

    if (uploadError) throw new Error("身分証のアップロードに失敗しました: " + uploadError.message);
    id_document_url = filePath;
  }

  // Create withdrawal request
  const { error } = await supabase.from("withdrawal_requests").insert({
    user_id: user.id,
    amount,
    bank_name,
    branch_name,
    account_number,
    account_holder_name,
    id_document_url,
  });

  if (error) throw new Error("出金申請に失敗しました: " + error.message);

  // Save bank info to seller_profiles for next time
  await supabase
    .from("seller_profiles")
    .update({
      bank_name,
      branch_name,
      account_number,
      account_holder_name,
      id_document_url: id_document_url ?? seller.id_document_url,
      verified_address: seller.address,
      bank_verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  revalidatePath("/sell/withdraw");
  redirect("/sell/withdraw");
}
