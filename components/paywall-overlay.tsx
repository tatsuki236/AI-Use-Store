"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/app/articles/[id]/purchase-button";

export function PaywallOverlay({
  price,
  articleId,
  isLoggedIn,
  isPending,
}: {
  price: number;
  articleId: string;
  isLoggedIn: boolean;
  isPending: boolean;
}) {
  return (
    <div className="relative mt-0">
      {/* Blur preview overlay */}
      <div className="absolute -top-32 left-0 right-0 h-32 bg-gradient-to-t from-card via-card/95 to-transparent z-10 pointer-events-none" />

      {/* Paywall card */}
      <div className="relative z-20 border border-border/60 rounded-xl p-6 sm:p-8 text-center bg-muted/30 backdrop-blur-sm">
        {/* Lock icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {isPending ? (
          <>
            <div className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              決済処理中
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              決済を処理しています。完了すると全文をお読みいただけます。
            </p>
          </>
        ) : (
          <>
            <p className="text-base font-bold mb-1">
              この続きを読むには購入が必要です
            </p>
            <p className="text-3xl font-extrabold text-primary mb-2">
              ¥{price.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              購入すると全文をお読みいただけます
            </p>
            {isLoggedIn ? (
              <div className="max-w-xs mx-auto">
                <PurchaseButton articleId={articleId} />
              </div>
            ) : (
              <div className="max-w-xs mx-auto space-y-2">
                <Link href="/login" className="block">
                  <Button className="w-full">ログインして購入</Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  アカウントをお持ちでない方は
                  <Link href="/signup" className="text-primary hover:underline ml-1">
                    新規登録
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
