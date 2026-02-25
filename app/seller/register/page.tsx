import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SellerRegistrationForm } from "./seller-registration-form";

export default async function SellerRegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: seller } = await supabase
    .from("seller_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">出品者登録</h1>

        {seller?.status === "approved" ? (
          <div className="bg-card border rounded-xl p-6 sm:p-8 text-center space-y-4">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 text-sm px-4 py-1">
              承認済み
            </Badge>
            <p className="text-lg font-medium">
              出品者として承認されています。
            </p>
            <Link href="/sell">
              <Button>出品ダッシュボードへ</Button>
            </Link>
          </div>
        ) : seller?.status === "pending" ? (
          <div className="bg-card border rounded-xl p-6 sm:p-8 text-center space-y-4">
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-600 text-sm px-4 py-1"
            >
              審査中
            </Badge>
            <p className="text-lg font-medium">
              出品者登録の審査中です。
            </p>
            <p className="text-muted-foreground">
              管理者による審査が完了するまでお待ちください。
              承認されると出品が可能になります。
            </p>
          </div>
        ) : seller?.status === "rejected" ? (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-sm px-4 py-1 mb-3">
                却下
              </Badge>
              <p className="font-medium">申請が却下されました。</p>
              {seller.rejection_reason && (
                <p className="text-sm text-red-600 mt-2">
                  理由: {seller.rejection_reason}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                以下のフォームから修正して再申請してください。
              </p>
            </div>
            <SellerRegistrationForm existing={seller} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6">
              <p className="text-muted-foreground">
                教材を出品するには、出品者登録が必要です。
                以下の情報を入力して申請してください。
                管理者による審査後、出品が可能になります。
              </p>
            </div>
            <SellerRegistrationForm />
          </div>
        )}
      </main>
    </div>
  );
}
