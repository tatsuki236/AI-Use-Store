import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "ファイルが必要です" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "許可されていないファイル形式です (JPEG, PNG, WebP, GIF のみ)" },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "ファイルサイズは5MB以下にしてください" },
      { status: 400 }
    );
  }

  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("article-images")
    .upload(filePath, file, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { error: "アップロードに失敗しました: " + uploadError.message },
      { status: 500 }
    );
  }

  const { data: urlData } = supabase.storage
    .from("article-images")
    .getPublicUrl(filePath);

  return NextResponse.json({ url: urlData.publicUrl });
}
