"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { createLesson, updateLesson } from "../../actions";

type Lesson = {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  sort_order: number;
};

export function LessonFormDialog({
  courseId,
  lesson,
  nextOrder,
}: {
  courseId: string;
  lesson?: Lesson;
  nextOrder?: number;
}) {
  const [open, setOpen] = useState(false);
  const isEdit = !!lesson;

  async function handleSubmit(formData: FormData) {
    if (isEdit) {
      await updateLesson(lesson.id, courseId, formData);
    } else {
      await createLesson(courseId, formData);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={isEdit ? "outline" : "default"}>
          {isEdit ? "編集" : "新規レッスン追加"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "レッスン編集" : "新規レッスン追加"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">タイトル</Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={lesson?.title}
              placeholder="例: 第1回 AIとは何か"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">コンテンツ (Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              rows={12}
              defaultValue={lesson?.content}
              placeholder="Markdownで記述..."
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video_url">動画URL (埋め込み用)</Label>
            <Input
              id="video_url"
              name="video_url"
              type="url"
              defaultValue={lesson?.video_url ?? ""}
              placeholder="https://www.youtube.com/embed/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort_order">表示順</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min={0}
              defaultValue={lesson?.sort_order ?? nextOrder ?? 1}
            />
          </div>
          <Button type="submit">{isEdit ? "更新する" : "追加する"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
