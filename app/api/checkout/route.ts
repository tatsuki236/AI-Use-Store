import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
    }

    const { articleId } = await req.json();
    if (!articleId) {
      return NextResponse.json({ error: "記事IDが必要です" }, { status: 400 });
    }

    // Fetch article
    const { data: article } = await supabase
      .from("articles")
      .select("id, title, price, is_free, published, slug")
      .eq("id", articleId)
      .eq("published", true)
      .single();

    if (!article) {
      return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
    }

    if (article.is_free) {
      return NextResponse.json({ error: "この記事は無料です" }, { status: 400 });
    }

    if (!article.price || article.price <= 0) {
      return NextResponse.json({ error: "価格が設定されていません" }, { status: 400 });
    }

    // Check if already purchased
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("article_id", articleId)
      .single();

    if (existingPurchase?.status === "completed") {
      return NextResponse.json({ error: "既に購入済みです" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const successUrl = `${origin}/articles/${article.slug || article.id}?purchased=true`;
    const cancelUrl = `${origin}/articles/${article.slug || article.id}`;

    // Call Stripe API directly via fetch
    const stripeKey = process.env.STRIPE_SECRET_KEY!;
    const params = new URLSearchParams();
    params.append("mode", "payment");
    params.append("payment_method_types[0]", "card");
    params.append("line_items[0][price_data][currency]", "jpy");
    params.append("line_items[0][price_data][product_data][name]", article.title);
    params.append("line_items[0][price_data][product_data][description]", "A-Note Academy 記事");
    params.append("line_items[0][price_data][unit_amount]", String(article.price));
    params.append("line_items[0][quantity]", "1");
    params.append("metadata[user_id]", user.id);
    params.append("metadata[article_id]", article.id);
    params.append("metadata[purchase_id]", existingPurchase?.id || "");
    params.append("success_url", successUrl);
    params.append("cancel_url", cancelUrl);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const stripeData = await stripeRes.json();

    if (!stripeRes.ok) {
      console.error("Stripe API error:", stripeData);
      return NextResponse.json(
        { error: "決済の処理中にエラーが発生しました。しばらくしてからお試しください。" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: stripeData.url });
  } catch (err: unknown) {
    console.error("Checkout error:", err);
    const message = err instanceof Error ? err.message : "不明なエラー";
    return NextResponse.json(
      { error: `決済の処理中にエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
