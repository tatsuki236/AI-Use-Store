import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArticleEditor } from "@/components/article-editor";
import { createUserArticle } from "./actions";

export default async function SellNewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("status")
    .eq("user_id", user.id)
    .single();

  if (!seller || seller.status !== "approved") {
    redirect("/seller/register");
  }

  return <ArticleEditor formAction={createUserArticle} />;
}
