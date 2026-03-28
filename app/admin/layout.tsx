import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        {/* Row 1: Logo + user */}
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <Link href="/admin" className="font-bold text-lg flex-shrink-0">
            AiUseStore Admin
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user.email}
            </span>
            <Link href="/account">
              <Button variant="outline" size="sm">
                アカウント
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm">
                ログアウト
              </Button>
            </form>
          </div>
        </div>
        {/* Row 2: Nav (horizontally scrollable on mobile) */}
        <div className="border-t">
          <nav className="container mx-auto px-4 flex gap-1 overflow-x-auto scrollbar-hide">
            {[
              { href: "/admin", label: "購入管理" },
              { href: "/admin/users", label: "ユーザー管理" },
              { href: "/admin/articles", label: "記事管理" },
              { href: "/admin/review", label: "記事審査" },
              { href: "/admin/sellers", label: "出品者審査" },
              { href: "/admin/withdrawals", label: "出金管理" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap px-3 py-2.5 flex-shrink-0"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-6 sm:py-8 px-4">{children}</main>
    </div>
  );
}
