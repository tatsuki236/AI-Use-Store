"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isInAppBrowser } from "@/lib/detect-inapp-browser";

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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inApp, setInApp] = useState(false);
  // "otp-email" = OTPメール入力, "otp-code" = OTPコード入力, "password" = パスワードログイン
  const [loginMode, setLoginMode] = useState<"otp-email" | "otp-code" | "password">("password");
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const detected = isInAppBrowser();
    setInApp(detected);
    if (detected) {
      setLoginMode("otp-email");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleGoogleLogin() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setOtpSent(true);
      setLoginMode("otp-code");
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleResendOtp() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setError(error.message);
    } else {
      setError("");
      setOtpCode("");
    }
    setLoading(false);
  }

  // OTPフロー: メールアドレス入力画面
  function renderOtpEmailForm() {
    return (
      <>
        <h2 className="text-2xl font-bold text-center">ログイン</h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          認証コードでログイン
        </p>

        {error && (
          <div className="mt-6 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              メールアドレス
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
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "送信中..." : "認証コードを送信"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setLoginMode("password");
              setError("");
            }}
            className="text-sm text-primary hover:underline"
          >
            パスワードでログイン
          </button>
        </div>
      </>
    );
  }

  // OTPフロー: コード入力画面
  function renderOtpCodeForm() {
    return (
      <>
        <h2 className="text-2xl font-bold text-center">認証コードを入力</h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          <span className="font-medium text-foreground">{email}</span> に送信しました
        </p>

        {error && (
          <div className="mt-6 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-xs font-medium">
              6桁の認証コード
            </Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
              required
              className="h-11 rounded-xl text-center text-lg tracking-[0.3em]"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold"
            disabled={loading || otpCode.length !== 6}
          >
            {loading ? "認証中..." : "ログイン"}
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          <button
            type="button"
            onClick={() => {
              setLoginMode("otp-email");
              setOtpCode("");
              setError("");
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors block mx-auto"
          >
            ← メールアドレスに戻る
          </button>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="text-sm text-primary hover:underline"
          >
            コードを再送信
          </button>
        </div>
      </>
    );
  }

  // パスワードログインフォーム（通常 or アプリ内ブラウザからの切り替え）
  function renderPasswordForm() {
    return (
      <>
        <h2 className="text-2xl font-bold text-center">ログイン</h2>
        <p className="mt-1 text-sm text-muted-foreground text-center">
          アカウントにログインして学習を続けましょう
        </p>

        {/* Google OAuth: 通常ブラウザのみ表示 */}
        {!inApp && (
          <>
            <div className="mt-8">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl text-sm font-medium"
                onClick={handleGoogleLogin}
              >
                <GoogleIcon />
                <span className="ml-2">Googleでログイン</span>
              </Button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-muted/30 px-3 text-xs text-muted-foreground">
                  またはメールでログイン
                </span>
              </div>
            </div>
          </>
        )}

        {error && (
          <div className={`text-sm text-destructive bg-destructive/10 p-3 rounded-lg ${inApp ? "mt-8" : ""} mb-4`}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className={`space-y-4 ${!error && inApp ? "mt-8" : ""}`}>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
              メールアドレス
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
              パスワード
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold"
            disabled={loading}
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        {/* アプリ内ブラウザの場合、OTPに戻るリンクを表示 */}
        {inApp && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setLoginMode("otp-email");
                setError("");
              }}
              className="text-sm text-primary hover:underline"
            >
              ← 認証コードでログイン
            </button>
          </div>
        )}
      </>
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

          {loginMode === "otp-email" && renderOtpEmailForm()}
          {loginMode === "otp-code" && renderOtpCodeForm()}
          {loginMode === "password" && renderPasswordForm()}

          {/* Section 3: Navigation */}
          <div className="mt-8 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              アカウントがない場合は{" "}
              <Link href="/signup" className="text-primary font-medium hover:underline">
                新規登録
              </Link>
            </p>
            <Link
              href="/"
              className="inline-block text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← トップに戻る
            </Link>
          </div>

          {/* Section 4: Trust */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground transition-colors">利用規約</Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-foreground transition-colors">プライバシーポリシー</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
