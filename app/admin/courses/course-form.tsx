"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCourse, updateCourse } from "./actions";

type Course = {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail_url: string | null;
};

export function CourseForm({ course }: { course?: Course }) {
  const action = course
    ? updateCourse.bind(null, course.id)
    : createCourse;

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">コース名</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={course?.title}
          placeholder="例: AI入門コース"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">説明</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={course?.description}
          placeholder="コースの概要を入力..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">価格 (円)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          defaultValue={course?.price ?? 0}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="thumbnail_url">サムネイルURL</Label>
        <Input
          id="thumbnail_url"
          name="thumbnail_url"
          type="url"
          defaultValue={course?.thumbnail_url ?? ""}
          placeholder="https://..."
        />
      </div>
      <Button type="submit">{course ? "更新する" : "作成する"}</Button>
    </form>
  );
}
