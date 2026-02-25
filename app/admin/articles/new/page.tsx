import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleForm } from "../article-form";

export default function NewArticlePage() {
  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>新規教材作成</CardTitle>
        </CardHeader>
        <CardContent>
          <ArticleForm />
        </CardContent>
      </Card>
    </div>
  );
}
