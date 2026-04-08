import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { ArticleCard } from "@/components/article-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, email")
    .eq("id", id)
    .single();

  if (!profile) return { title: "著者が見つかりません" };

  const name = profile.display_name || profile.email?.split("@")[0] || "ユーザー";
  return {
    title: `${name}の記事一覧`,
    description: `${name}が公開している記事の一覧です。`,
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: profile }, { data: articles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, email, avatar_url")
      .eq("id", id)
      .single(),
    supabase
      .from("articles")
      .select("id, title, content, thumbnail_url, rating, price, is_free, created_at, purchase_count, review_count, like_count, category, slug")
      .eq("author_id", id)
      .eq("published", true)
      .eq("status", "published")
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) notFound();

  const authorName = profile.display_name || profile.email?.split("@")[0] || "ユーザー";
  const authorInitial = authorName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      <main className="container mx-auto max-w-5xl px-4 py-8">
        {/* Author Header */}
        <div className="flex items-center gap-4 mb-8">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt=""
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
              {authorInitial}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{authorName}</h1>
            <p className="text-sm text-muted-foreground">
              公開記事 {articles?.length ?? 0}件
            </p>
          </div>
        </div>

        {/* Article Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">まだ公開されている記事はありません。</p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 記事一覧に戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
