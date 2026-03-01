export const tagColors: Record<string, string> = {
  ChatGPT: "bg-emerald-100 text-emerald-700",
  プロンプト: "bg-amber-100 text-amber-700",
  画像生成: "bg-pink-100 text-pink-700",
  自動化: "bg-sky-100 text-sky-700",
  API: "bg-violet-100 text-violet-700",
  Claude: "bg-indigo-100 text-indigo-700",
  RAG: "bg-blue-100 text-blue-700",
  副業: "bg-orange-100 text-orange-700",
  Midjourney: "bg-rose-100 text-rose-700",
  Dify: "bg-teal-100 text-teal-700",
  キャリア: "bg-purple-100 text-purple-700",
  比較: "bg-cyan-100 text-cyan-700",
};

const cardGradients = [
  "from-violet-400 to-indigo-500",
  "from-amber-400 to-orange-500",
  "from-sky-400 to-cyan-500",
  "from-rose-400 to-pink-500",
  "from-emerald-400 to-teal-500",
  "from-fuchsia-400 to-purple-500",
];

export function getGradient(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cardGradients[Math.abs(hash) % cardGradients.length];
}

export function getTag(title: string): { label: string; color: string } | null {
  for (const [key, color] of Object.entries(tagColors)) {
    if (title.includes(key)) return { label: key, color };
  }
  return null;
}

export function isNew(dateStr: string): boolean {
  const created = new Date(dateStr);
  const now = new Date();
  const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export function getExcerpt(content: string, maxLength = 90): string {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*>`\-\n|]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
