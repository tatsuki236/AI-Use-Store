import Link from "next/link";
import { Header } from "@/components/header";

const sections = [
  {
    title: "第1条（サービス概要）",
    icon: "📋",
    content:
      "本規約は、AiUseStore（以下「当サービス」）が提供するすべてのサービスの利用条件を定めるものです。当サービスは、AI に関する記事・ナレッジコンテンツを提供するプラットフォームです。ユーザーは本規約に同意のうえ、当サービスをご利用ください。",
  },
  {
    title: "第2条（利用条件）",
    icon: "✅",
    content:
      "当サービスの利用にあたり、ユーザーは以下の条件を遵守するものとします。",
    items: [
      "正確な情報を登録すること",
      "アカウント情報を第三者に共有しないこと",
      "法令および本規約を遵守すること",
      "未成年者は保護者の同意を得たうえで利用すること",
    ],
  },
  {
    title: "第3条（禁止事項）",
    icon: "🚫",
    content: "ユーザーは、以下の行為を行ってはならないものとします。",
    items: [
      "コンテンツの無断転載・再配布・二次販売",
      "不正アクセスやシステムへの攻撃行為",
      "他のユーザーへの迷惑行為・誹謗中傷",
      "虚偽情報の登録や不正利用",
      "当サービスの運営を妨害する行為",
    ],
  },
  {
    title: "第4条（知的財産権）",
    icon: "🔒",
    content:
      "当サービス上のすべてのコンテンツ（テキスト、画像、動画、プログラムコード等）に関する著作権およびその他の知的財産権は、当サービスまたは正当な権利を有する第三者に帰属します。ユーザーは、個人的な学習目的以外での利用はできません。",
  },
  {
    title: "第5条（免責事項）",
    icon: "⚠️",
    content:
      "当サービスは、提供する情報の正確性・完全性について保証するものではありません。コンテンツの利用により生じた損害について、当サービスは一切の責任を負いません。また、サービスの中断・停止・変更により生じた損害についても同様とします。",
  },
  {
    title: "第6条（規約の変更）",
    icon: "🔄",
    content:
      "当サービスは、必要に応じて本規約を変更できるものとします。変更後の規約は、当サービス上に掲載した時点で効力を生じるものとします。重大な変更がある場合は、事前にユーザーへ通知いたします。",
  },
  {
    title: "第7条（準拠法・管轄）",
    icon: "⚖️",
    content:
      "本規約の解釈および適用は、日本法に準拠するものとします。本規約に関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-accent/20 border-b border-border/50">
        <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            利用規約
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
