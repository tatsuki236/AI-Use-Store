import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
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

  // Create Stripe Checkout Session
  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: article.title,
            description: "A-Note Academy 記事",
          },
          unit_amount: article.price,
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: user.id,
      article_id: article.id,
      purchase_id: existingPurchase?.id || "",
    },
    success_url: `${origin}/articles/${article.slug || article.id}?purchased=true`,
    cancel_url: `${origin}/articles/${article.slug || article.id}`,
  });

  return NextResponse.json({ url: session.url });
}
