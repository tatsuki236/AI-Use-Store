import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DeleteCourseButton } from "./delete-course-button";

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, lessons:lessons(count)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">コース管理</h1>
          <p className="text-muted-foreground mt-1">
            コースの作成・編集・削除を行います
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>新規コース作成</Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          コースがまだありません
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コース名</TableHead>
                <TableHead>価格</TableHead>
                <TableHead>レッスン数</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const lessonCount = (course.lessons as unknown as { count: number }[])?.[0]?.count ?? 0;
                return (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>
                      {course.price === 0 ? (
                        <Badge variant="secondary">無料</Badge>
                      ) : (
                        `¥${course.price.toLocaleString()}`
                      )}
                    </TableCell>
                    <TableCell>{lessonCount}件</TableCell>
                    <TableCell>
                      {new Date(course.created_at).toLocaleDateString("ja-JP")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button size="sm" variant="outline">編集</Button>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/lessons`}>
                        <Button size="sm" variant="outline">レッスン管理</Button>
                      </Link>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
