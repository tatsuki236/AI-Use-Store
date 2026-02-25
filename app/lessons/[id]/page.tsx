import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LessonContent } from "./lesson-content";

export default async function LessonPage({
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

  // Fetch lesson - RLS will block if user hasn't purchased
  const { data: lesson, error } = await supabase
    .from("lessons")
    .select(`
      id,
      title,
      content,
      video_url,
      sort_order,
      course_id,
      courses:course_id (id, title)
    `)
    .eq("id", id)
    .single();

  if (error || !lesson) {
    // Could be RLS blocking or lesson doesn't exist
    notFound();
  }

  const course = lesson.courses as unknown as { id: string; title: string } | null;

  // Get sibling lessons for navigation
  const { data: siblingLessons } = await supabase
    .from("lessons")
    .select("id, title, sort_order")
    .eq("course_id", lesson.course_id)
    .order("sort_order", { ascending: true });

  const currentIndex = siblingLessons?.findIndex((l) => l.id === lesson.id) ?? -1;
  const prevLesson = currentIndex > 0 ? siblingLessons?.[currentIndex - 1] : null;
  const nextLesson =
    siblingLessons && currentIndex < siblingLessons.length - 1
      ? siblingLessons[currentIndex + 1]
      : null;

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            ホーム
          </Link>
          <span>/</span>
          {course && (
            <>
              <Link
                href={`/courses/${course.id}`}
                className="hover:text-foreground transition-colors"
              >
                {course.title}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground">{lesson.title}</span>
        </nav>

        {/* Video Player */}
        {lesson.video_url && (
          <div className="aspect-video relative bg-black rounded-lg overflow-hidden mb-8">
            <iframe
              src={lesson.video_url}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {/* Lesson Title */}
        <h1 className="text-3xl font-bold mb-8">{lesson.title}</h1>

        {/* Markdown Content */}
        <LessonContent content={lesson.content} />

        <Separator className="my-8" />

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {prevLesson ? (
            <Link href={`/lessons/${prevLesson.id}`}>
              <Button variant="outline">
                ← {prevLesson.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.id}`}>
              <Button variant="outline">
                {nextLesson.title} →
              </Button>
            </Link>
          ) : course ? (
            <Link href={`/courses/${course.id}`}>
              <Button variant="outline">コースに戻る</Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
