import Link from "next/link";
import { Header } from "@/components/header";

const legalInfo = [
  { label: "販売業者", value: "株式会社Keymarks", icon: "🏢" },
  { label: "運営責任者", value: "代表取締役", icon: "👤" },
  { label: "所在地", value: "〒107-0062 東京都港区南青山3-8-40 青山センタービル 2F 219号", icon: "📍" },
  {
    label: "連絡先",
    value: "info@aiusestore.com",
    href: "mailto:info@aiusestore.com",
    icon: "📧",
    extra: "（またはお問い合わせフォーム）",
    extraHref: "/contact",
  },
  { label: "販売価格", value: "各記事ページに記載の価格（税込）", icon: "💰" },
  { label: "追加費用", value: "なし（通信料等はお客様負担）", icon: "📝" },
  { label: "支払方法", value: "クレジットカード（Stripe決済）", icon: "💳" },
  { label: "支払時期", value: "購入手続き完了時に即時決済", icon: "🕐" },
  { label: "商品の引渡時期", value: "決済完了後、即時閲覧可能", icon: "📖" },
  {
    label: "返品・キャンセル",
    value:
      "デジタルコンテンツの性質上、購入後の返品・キャンセルは原則としてお受けできません。ただし、コンテンツに重大な瑕疵がある場合は個別に対応いたします。",
    icon: "🔄",
  },
  {
    label: "動作環境",
    value: "最新のWebブラウザ（Chrome、Safari、Firefox、Edge）",
    icon: "🌐",
  },
];

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/8 via-background to-accent/20 border-b border-border/50">
        <div className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            特定商取引法に基づく表記
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            最終更新日: 2025年4月1日
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-3xl px-4 py-10">
        <div className="bg-card rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/50">
          {legalInfo.map((item) => (
            <div key={item.label} className="flex gap-4 px-6 py-4 sm:px-8">
              <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed">
                  {item.href ? (
                    <>
                      <a
                        href={item.href}
                        className="text-primary hover:underline"
                      >
                        {item.value}
                      </a>
                      {"extra" in item && "extraHref" in item && (
                        <>
                          {" "}
                          <Link href={(item as { extraHref: string }).extraHref} className="text-primary hover:underline">
                            {(item as { extra: string }).extra}
                          </Link>
                        </>
                      )}
                    </>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            </div>
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
