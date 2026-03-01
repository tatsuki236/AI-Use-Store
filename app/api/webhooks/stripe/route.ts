import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role client for webhook (no user session)
function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { user_id, article_id, purchase_id } = session.metadata || {};

    if (!user_id || !article_id) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch article for fee calculation
    const { data: article } = await supabase
      .from("articles")
      .select("price")
      .eq("id", article_id)
      .single();

    const amount = article?.price ?? 0;
    const platformFee = Math.floor(amount * 0.20); // 20% total (15% platform + 5% card)
    const sellerAmount = amount - platformFee;

    // Create or update purchase record
    if (purchase_id) {
      await supabase
        .from("purchases")
        .update({ status: "completed" })
        .eq("id", purchase_id);
    } else {
      await supabase.from("purchases").upsert(
        {
          user_id,
          article_id,
          status: "completed",
        },
        { onConflict: "user_id,article_id" }
      );
    }

    // Record stripe payment
    await supabase.from("stripe_payments").insert({
      user_id,
      article_id,
      purchase_id: purchase_id || null,
      stripe_session_id: session.id,
      stripe_payment_intent:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null,
      amount,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
      currency: "jpy",
      status: "completed",
    });
  }

  return NextResponse.json({ received: true });
}
