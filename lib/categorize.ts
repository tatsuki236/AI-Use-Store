import { GoogleGenerativeAI } from "@google/generative-ai";
import { tagColors } from "@/lib/article-utils";

const CATEGORIES = Object.keys(tagColors);

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export async function categorizeArticle(
  title: string,
  content: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const plainContent = stripHtml(content).slice(0, 500);

    const prompt = `以下の記事のタイトルと本文を読み、最も適切なカテゴリを1つだけ選んでください。

カテゴリ一覧: ${CATEGORIES.join(", ")}

タイトル: ${title}
本文: ${plainContent}

ルール:
- 上記のカテゴリ一覧から最も適切な1つだけを返してください
- カテゴリ名のみを返してください（説明不要）
- どのカテゴリにも当てはまらない場合は「なし」と返してください`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    if (CATEGORIES.includes(text)) {
      return text;
    }

    return null;
  } catch {
    return null;
  }
}
