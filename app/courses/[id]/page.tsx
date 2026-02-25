import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PurchaseButton } from "./purchase-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!course) return { title: "コースが見つかりません" };

  return {
    title: course.title,
    description: course.description,
    openGraph: { title: course.title, description: course.description },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  // Get lesson titles via RPC (bypasses RLS to show titles to everyone)
  const { data: lessons } = await supabase
    .rpc("get_course_lessons", { p_course_id: id }) as {
      data: { id: string; title: string; sort_order: number }[] | null;
    };

  // Check if user has purchased this course
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let purchaseStatus: string | null = null;
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("status")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .single();
    purchaseStatus = purchase?.status ?? null;
  }

  const hasAccess = purchaseStatus === "completed";

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Thumbnail */}
            <div className="aspect-video relative bg-muted rounded-lg overflow-hidden mb-6">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground mt-4 whitespace-pre-wrap">
              {course.description}
            </p>

            <Separator className="my-8" />

            {/* Lesson List */}
            <h2 className="text-xl font-bold mb-4">
              レッスン一覧
              {lessons && (
                <span className="text-muted-foreground font-normal text-base ml-2">
                  ({lessons.length}件)
                </span>
              )}
            </h2>

            {!lessons || lessons.length === 0 ? (
              <p className="text-muted-foreground">レッスンは準備中です</p>
            ) : (
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <Card key={lesson.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm font-mono w-8">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="font-medium">{lesson.title}</span>
                      </div>
                      {hasAccess ? (
                        <Link href={`/lessons/${lesson.id}`}>
                          <Button size="sm" variant="outline">
                            読む
                          </Button>
                        </Link>
                      ) : (
                        <Badge variant="secondary">購入後に閲覧可能</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    {course.price === 0 ? (
                      <p className="text-3xl font-bold">無料</p>
                    ) : (
                      <p className="text-3xl font-bold">
                        ¥{course.price.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {hasAccess ? (
                    <div className="space-y-3">
                      <Badge className="w-full justify-center py-2" variant="default">
                        購入済み
                      </Badge>
                      {lessons && lessons.length > 0 && (
                        <Link href={`/lessons/${lessons[0].id}`} className="block">
                          <Button className="w-full">最初のレッスンを読む</Button>
                        </Link>
                      )}
                    </div>
                  ) : purchaseStatus === "pending" ? (
                    <Badge
                      className="w-full justify-center py-2"
                      variant="outline"
                    >
                      承認待ち
                    </Badge>
                  ) : user ? (
                    <PurchaseButton courseId={course.id} />
                  ) : (
                    <Link href="/login" className="block">
                      <Button className="w-full">ログインして購入</Button>
                    </Link>
                  )}

                  <Separator />
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>全 {lessons?.length ?? 0} レッスン</li>
                    <li>記事形式で学習</li>
                    <li>購入後は無制限アクセス</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
