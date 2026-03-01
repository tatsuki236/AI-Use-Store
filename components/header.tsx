import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/search-box";
import { MobileMenuButton } from "@/components/mobile-menu";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  let sellerStatus: string | null = null;
  let cartCount = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";

    const { data: seller } = await supabase
      .from("seller_profiles")
      .select("status")
      .eq("user_id", user.id)
      .single();
    sellerStatus = seller?.status ?? null;

    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    cartCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
      {/* ===== Desktop Header ===== */}
      <div className="hidden sm:grid container mx-auto grid-cols-[auto_1fr_auto] items-center h-14 px-4 gap-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg tracking-tight">
            AiUseStore
          </span>
        </Link>

        {/* Center: Search */}
        <div className="max-w-lg mx-auto w-full">
          <SearchBox />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <Link href={sellerStatus === "approved" ? "/sell" : "/seller/register"}>
                <Button variant="ghost" size="sm" className="text-xs">
                  出品する
                </Button>
              </Link>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-xs">
                    管理画面
                  </Button>
                </Link>
              )}
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
                  ログアウト
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/seller/register">
                <Button variant="ghost" size="sm" className="text-xs">
                  出品する
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  ログイン
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="rounded-full px-4">
                  新規登録
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* ===== Mobile Header (Amazon-style) ===== */}
      <div className="sm:hidden relative">
        {/* Row 1: Menu | Logo | Create | Login | Cart */}
        <div className="flex items-center h-12 px-3 gap-1.5">
          {/* Hamburger menu */}
          <MobileMenuButton isAdmin={isAdmin} isLoggedIn={!!user} sellerStatus={sellerStatus} />

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-xs">AI</span>
            </div>
            <span className="font-bold text-base tracking-tight truncate">
              AiUseStore
            </span>
          </Link>

          {/* Create Article / 出品 */}
          <Link
            href={user ? (sellerStatus === "approved" ? "/sell/new" : "/seller/register") : "/seller/register"}
            className="flex-shrink-0 h-7 px-2.5 flex items-center gap-1 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="出品する"
          >
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-xs font-semibold text-primary">出品</span>
          </Link>

          {/* Login / Avatar */}
          {user ? (
            <Link href="/account" className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link href="/login" className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              <svg className="w-[22px] h-[22px] text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
          )}

          {/* Cart */}
          <Link
            href={user ? "/purchases" : "/login"}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center relative"
            aria-label="購入履歴"
          >
            <svg className="w-[22px] h-[22px] text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold leading-none px-1">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Row 2: Amazon-style search bar */}
        <div className="px-3 pb-2.5">
          <SearchBox />
        </div>
      </div>
    </header>
  );
}
