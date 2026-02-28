import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { ArticleEditor } from "@/components/article-editor";
import { updateUserArticle } from "./actions";

export default async function SellEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .single();

  if (!article) notFound();

  if (article.status !== "draft" && article.status !== "rejected") {
    redirect("/sell");
  }

  const action = updateUserArticle.bind(null, article.id);

  const rejectionNotice =
    article.status === "rejected" && article.rejection_reason ? (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 mb-2">
          却下
        </Badge>
        <p className="text-sm text-red-600">
          却下理由: {article.rejection_reason}
        </p>
      </div>
    ) : undefined;

  return (
    <ArticleEditor
      formAction={action}
      article={article}
      rejectionNotice={rejectionNotice}
    />
  );
}
