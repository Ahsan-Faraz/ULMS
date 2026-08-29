import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/database/drizzle";
import { librarySettings } from "@/database/schema";
import { getLibrarySettings } from "@/lib/settings";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !secret) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.created" ||
      event.type === "invoice.paid"
    ) {
      const settings = await getLibrarySettings();
      if (settings.id !== "local") {
        const customerId =
          "customer" in event.data.object &&
          typeof event.data.object.customer === "string"
            ? event.data.object.customer
            : settings.stripeCustomerId;

        await db
          .update(librarySettings)
          .set({
            plan: "PRO",
            stripeCustomerId: customerId,
            updatedAt: new Date(),
          })
          .where(eq(librarySettings.id, settings.id));
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const settings = await getLibrarySettings();
      if (settings.id !== "local") {
        await db
          .update(librarySettings)
          .set({ plan: "FREE", updatedAt: new Date() })
          .where(eq(librarySettings.id, settings.id));
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.log(error, "Stripe webhook failed");
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
