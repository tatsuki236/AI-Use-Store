"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // TODO: バックエンド送信処理を実装
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h2 className="text-lg font-semibold text-emerald-800">送信が完了しました</h2>
        <p className="mt-2 text-sm text-emerald-700">
          お問い合わせいただきありがとうございます。内容を確認のうえ、ご連絡いたします。
        </p>
        <div className="mt-6">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1.5">
            お名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="山田 太郎"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1.5">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
            件名 <span className="text-red-500">*</span>
          </label>
          <select
            id="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            <option value="">選択してください</option>
            <option value="サービスについて">サービスについて</option>
            <option value="記事について">記事について</option>
            <option value="お支払いについて">お支払いについて</option>
            <option value="アカウントについて">アカウントについて</option>
            <option value="不具合の報告">不具合の報告</option>
            <option value="その他">その他</option>
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5">
            お問い合わせ内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-vertical"
            placeholder="お問い合わせ内容をご記入ください"
          />
        </div>

        <Button type="submit" disabled={sending} className="rounded-full px-8">
          {sending ? "送信中..." : "送信する"}
        </Button>
      </form>

    </>
  );
}
