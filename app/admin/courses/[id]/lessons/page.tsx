import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LessonFormDialog } from "./lesson-form-dialog";
import { DeleteLessonButton } from "./delete-lesson-button";

export default async function AdminLessonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">レッスン管理</h1>
          <p className="text-muted-foreground mt-1">{course.title}</p>
        </div>
        <LessonFormDialog courseId={courseId} nextOrder={(lessons?.length ?? 0) + 1} />
      </div>

      {!lessons || lessons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            レッスンがまだありません。「新規レッスン追加」から作成してください。
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">順番</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>動画</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell className="font-mono">{lesson.sort_order}</TableCell>
                  <TableCell className="font-medium">{lesson.title}</TableCell>
                  <TableCell>
                    {lesson.video_url ? (
                      <Badge variant="default">あり</Badge>
                    ) : (
                      <Badge variant="secondary">なし</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <LessonFormDialog courseId={courseId} lesson={lesson} />
                    <DeleteLessonButton
                      lessonId={lesson.id}
                      courseId={courseId}
                      lessonTitle={lesson.title}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
