import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleForm } from "../article-form";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>教材編集: {article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleForm article={article} />
        </CardContent>
      </Card>
    </div>
  );
}
