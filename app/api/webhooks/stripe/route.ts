import { NextResponse } from "next/server";

/** Stripe webhook stub — maps subscriptions to plan_tier on organizations */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const raw = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({
      received: true,
      mode: "demo",
      bytes: raw.length,
      signaturePresent: Boolean(signature),
    });
  }

  // Production: stripe.webhooks.constructEvent + update org plan_tier
  return NextResponse.json({ received: true });
}
