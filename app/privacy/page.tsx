import Link from "next/link";
import { Header } from "@/components/header";

const sections = [
  {
    title: "1. 収集する情報",
    icon: "📊",
    content: "当サービスでは、以下の情報を収集する場合があります。",
    items: [
      "氏名、メールアドレス等のアカウント情報",
      "Google認証連携によるプロフィール情報",
      "決済に必要な情報（クレジットカード情報は決済事業者が管理）",
      "サービス利用に伴うアクセスログ、閲覧履歴",
      "Cookie およびデバイス情報",
    ],
  },
  {
    title: "2. 利用目的",
    icon: "🎯",
    content: "収集した情報は、以下の目的で利用いたします。",
    items: [
      "サービスの提供・運営・改善",
      "ユーザーサポート・お問い合わせ対応",
      "購入履歴の管理・決済処理",
      "サービスに関するお知らせ・更新情報の送信",
      "不正利用の防止・セキュリティ確保",
      "利用状況の分析・統計データの作成",
    ],
  },
  {
    title: "3. 第三者提供",
    icon: "🤝",
    content:
      "当サービスは、以下の場合を除き、ユーザーの個人情報を第三者に提供いたしません。",
    items: [
      "ユーザー本人の同意がある場合",
      "法令に基づく場合",
      "人の生命・身体・財産の保護に必要な場合",
      "サービス運営に必要な業務委託先への提供（守秘義務契約を締結）",
    ],
  },
  {
    title: "4. Cookie・アナリティクス",
    icon: "🍪",
    content:
      "当サービスでは、利便性向上およびサービス改善のためにCookieを使用しています。また、Google Analytics等のアクセス解析ツールを利用する場合があります。これらのツールはCookieを使用してデータを収集しますが、個人を特定する情報は含まれません。ブラウザの設定によりCookieを無効にすることが可能ですが、一部機能が制限される場合があります。",
  },
  {
    title: "5. Google認証連携",
    icon: "🔑",
    content:
      "当サービスでは、Googleアカウントを利用したログイン機能を提供しています。Google認証を利用した場合、Googleから提供されるプロフィール情報（名前、メールアドレス、プロフィール画像）を取得します。取得した情報はアカウント管理の目的のみに使用し、それ以外の目的では使用いたしません。",
  },
  {
    title: "6. データ保護",
    icon: "🛡️",
    content:
      "当サービスは、ユーザーの個人情報を適切に管理し、不正アクセス・漏洩・紛失等の防止に努めます。データは暗号化された通信（SSL/TLS）を通じて送受信され、適切なセキュリティ対策を講じたサーバーに保管されます。",
  },
  {
    title: "7. お問い合わせ",
    icon: "💬",
    content: "プライバシーポリシーに関するお問い合わせは、",
    link: { href: "/contact", label: "お問い合わせフォーム" },
    contentAfter: "よりご連絡ください。",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-accent/20 border-b border-border/50">
        <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            プライバシーポリシー
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            最終更新日: 2025年4月1日
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="space-y-5">
          {sections.map((s) => (
            <section
              key={s.title}
              className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
                <div>
                  <h2 className="text-base font-bold">{s.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {s.content}
                    {s.link && (
                      <>
                        <Link
                          href={s.link.href}
                          className="text-primary hover:underline"
                        >
                          {s.link.label}
                        </Link>
                        {s.contentAfter}
                      </>
                    )}
                  </p>
                  {s.items && (
                    <ul className="mt-3 space-y-1.5">
                      {s.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="text-primary mt-1 text-xs">●</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          ))}
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
