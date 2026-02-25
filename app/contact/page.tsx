import { Header } from "@/components/header";
import { ContactForm } from "./contact-form";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-accent/20 border-b border-border/50">
        <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            お問い合わせ
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            ご質問・ご要望がございましたら、以下のフォームよりお気軽にお問い合わせください。
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10">
        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border/60 p-5 text-center">
            <span className="text-2xl">💬</span>
            <p className="mt-2 text-sm font-semibold">一般的なご質問</p>
            <p className="mt-1 text-xs text-muted-foreground">
              サービスや教材について
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border/60 p-5 text-center">
            <span className="text-2xl">🐛</span>
            <p className="mt-2 text-sm font-semibold">不具合の報告</p>
            <p className="mt-1 text-xs text-muted-foreground">
              エラーや表示の問題など
            </p>
          </div>
          <div className="bg-card rounded-xl border border-border/60 p-5 text-center">
            <span className="text-2xl">💳</span>
            <p className="mt-2 text-sm font-semibold">お支払いについて</p>
            <p className="mt-1 text-xs text-muted-foreground">
              決済や返金に関するご相談
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8">
          <ContactForm />
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
