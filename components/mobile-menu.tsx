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

  const close = () => setOpen(false);

  const linkClass =
    "px-5 py-3 text-sm font-medium hover:bg-muted/50 transition-colors";
  const mutedLinkClass =
    "px-5 py-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors";
  const sectionLabel =
    "px-5 pt-4 pb-1 text-xs font-semibold text-muted-foreground tracking-wider uppercase";
  const divider = "border-t border-border/50 my-1";

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
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={close}
          />

          <div className="absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg z-50 max-h-[80vh] overflow-y-auto">
            <nav className="flex flex-col py-2">
              {/* Main navigation */}
              <Link href="/" onClick={close} className={linkClass}>
                トップ
              </Link>
              <Link href="/search" onClick={close} className={linkClass}>
                教材を探す
              </Link>
              {isLoggedIn && (
                <Link
                  href={sellerStatus === "approved" ? "/sell" : "/seller/register"}
                  onClick={close}
                  className={`${linkClass} text-primary`}
                >
                  出品する
                </Link>
              )}

              {/* Logged-in user sections */}
              {isLoggedIn && (
                <>
                  <div className={divider} />
                  <div className={sectionLabel}>設定</div>
                  <Link href="/account" onClick={close} className={linkClass}>
                    アカウント
                  </Link>
                  <Link href="/purchases" onClick={close} className={linkClass}>
                    購入履歴
                  </Link>
                  {sellerStatus === "approved" && (
                    <Link href="/sell/withdraw" onClick={close} className={linkClass}>
                      お支払先
                    </Link>
                  )}
                </>
              )}

              {/* Admin */}
              {isAdmin && (
                <>
                  <div className={divider} />
                  <Link href="/admin" onClick={close} className={linkClass}>
                    管理画面
                  </Link>
                </>
              )}

              <div className={divider} />

              {/* Auth & footer */}
              {isLoggedIn ? (
                <form action="/auth/signout" method="post" className="contents">
                  <button
                    type="submit"
                    className={`${mutedLinkClass} text-left`}
                  >
                    ログアウト
                  </button>
                </form>
              ) : (
                <>
                  <Link href="/login" onClick={close} className={linkClass}>
                    ログイン
                  </Link>
                  <Link href="/signup" onClick={close} className={`${linkClass} text-primary`}>
                    新規登録
                  </Link>
                </>
              )}
              <Link href="/contact" onClick={close} className={mutedLinkClass}>
                お問い合わせ
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
