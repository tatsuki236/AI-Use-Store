"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileMenuButton({
  isAdmin,
  isLoggedIn,
  sellerStatus,
}: {
  isAdmin: boolean;
  isLoggedIn: boolean;
  sellerStatus: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-8 h-8"
        aria-label="メニュー"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg z-50">
          <nav className="flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              トップ
            </Link>
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              教材を探す
            </Link>
            {isLoggedIn && (
              <Link
                href={sellerStatus === "approved" ? "/sell" : "/seller/register"}
                onClick={() => setOpen(false)}
                className="px-5 py-3 text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
              >
                出品する
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                管理画面
              </Link>
            )}
            <div className="border-t border-border/50 my-1" />
            {isLoggedIn ? (
              <form action="/auth/signout" method="post" className="contents">
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-medium text-left text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  ログアウト
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
                >
                  ログイン
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
                >
                  新規登録
                </Link>
              </>
            )}
            <div className="border-t border-border/50 my-1" />
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              お問い合わせ
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
