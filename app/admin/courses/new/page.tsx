import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "../course-form";

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>新規コース作成</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  );
}
