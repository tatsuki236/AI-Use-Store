"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isInAppBrowser } from "@/lib/detect-inapp-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const benefits = [
  { icon: "📚", title: "500+の記事", desc: "AI・プログラミングの実践記事" },
  { icon: "🎯", title: "実践重視", desc: "すぐに使えるスキルが身につく" },
  { icon: "🆓", title: "無料記事も充実", desc: "登録だけで読める記事多数" },
];

export default function SignupPage() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inApp, setInApp] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    setInApp(isInAppBrowser());
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!nickname.trim()) {
      setError("ニックネームを入力してください");
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { display_name: nickname.trim() },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      // セッションが返ってきた = そのままログイン済み → ニックネーム保存
      await supabase
        .from("profiles")
        .update({ display_name: nickname.trim() })
        .eq("id", data.session.user.id);
      router.push("/");
    } else {
      // メール確認が必要な場合のフォールバック
      setSuccess(true);
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  // Success state - confirmation email sent
  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">確認メールを送信しました</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">{email}</span> に確認メールを送信しました。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>

          {/* Steps */}
          <div className="mt-6 bg-muted/50 rounded-lg p-4 text-left">
            <p className="text-xs font-medium mb-2">登録完了までの流れ</p>
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
              <li>確認メールのリンクをクリック</li>
              <li>自動でログインされ、利用開始</li>
              <li className="text-muted-foreground/70">出品したい方はログイン後に出品者申請へ</li>
            </ol>
          </div>

          <Link href="/login" className="block mt-6">
            <Button className="w-full h-11 rounded-xl font-semibold">
              ログインページへ
            </Button>
          </Link>
          <Link
            href="/"
            className="inline-block mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← トップに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Left: Branding & Benefits */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary/10 via-primary/5 to-accent/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/8 via-transparent to-transparent" />
        <div className="relative flex flex-col justify-center px-12 xl:px-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">AI</span>
            </div>
            <span className="font-bold text-xl tracking-tight">AiUseStore</span>
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
            学びを、もっと<br />
            <span className="text-primary">自由</span>に。
          </h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            AIスキルを、実践的な記事で学べる<br />
            AI特化型ナレッジプラットフォーム
          </p>

          {/* Benefits */}
          <div className="mt-10 space-y-4">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{b.icon}</span>
                <div>
                  <p className="text-sm font-semibold">{b.title}</p>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold">AI</span>
              </div>
              <span className="font-bold text-xl tracking-tight">AiUseStore</span>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-center">新規登録</h2>
          <p className="mt-1 text-sm text-muted-foreground text-center">
            無料アカウントを作成して学習を始めましょう
          </p>

          {/* Section 1: Social Signup (通常ブラウザのみ) */}
          {!inApp && (
            <>
              <div className="mt-8">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 rounded-xl text-sm font-medium"
                  onClick={handleGoogleSignup}
                >
                  <GoogleIcon />
                  <span className="ml-2">Googleで登録</span>
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  メール認証なしですぐに利用開始できます
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-muted/30 px-3 text-xs text-muted-foreground">
                    またはメールで登録
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Section 2: Email Signup */}
          {!inApp && (
            <p className="text-[11px] text-muted-foreground text-center mb-4">
              メール登録には確認メールによる認証が必要です
            </p>
          )}
          {error && (
            <div className={`text-sm text-destructive bg-destructive/10 p-3 rounded-lg mb-4 ${inApp ? "mt-8" : ""}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className={`space-y-4 ${inApp && !error ? "mt-8" : ""}`}>
            <div className="space-y-1.5">
              <Label htmlFor="nickname" className="text-xs font-medium">
                ニックネーム <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nickname"
                type="text"
                placeholder="表示名を入力"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={30}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium">
                メールアドレス <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                パスワード <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="h-11 rounded-xl"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 rounded-xl font-semibold"
              disabled={loading}
            >
              {loading ? "登録中..." : "無料で登録する"}
            </Button>
          </form>

          {/* Section 3: Navigation */}
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              すでにアカウントがある場合は{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                ログイン
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← トップに戻る
            </Link>
          </div>

          {/* Seller note */}
          <div className="mt-6 bg-muted/50 rounded-lg p-3">
            <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
              記事を出品するには、アカウント作成後に別途{" "}
              <Link href="/seller/register" className="text-primary hover:underline font-medium">出品者申請</Link>
              {" "}が必要です。
            </p>
          </div>

          {/* Section 4: Trust & Legal */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              登録することで{" "}
              <Link href="/terms" className="hover:text-foreground transition-colors underline">利用規約</Link>
              {" "}と{" "}
              <Link href="/privacy" className="hover:text-foreground transition-colors underline">プライバシーポリシー</Link>
              {" "}に同意したものとみなされます。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
