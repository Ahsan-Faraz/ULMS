import Stripe from "stripe";
import { appUrl } from "@/lib/email";

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

export const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export async function createProCheckout() {
  const stripe = getStripe();
  if (!stripe) return null;

  return stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${appUrl()}/admin/settings?billing=success`,
    cancel_url: `${appUrl()}/admin/settings?billing=cancel`,
    line_items: [
      {
        price_data: {
          currency: "usd",
          recurring: { interval: "month" },
          unit_amount: 1900,
          product_data: {
            name: "Folio Campus Pro",
            description:
              "Holds, ISBN import, reminders, custom branding, unlimited catalog",
          },
        },
        quantity: 1,
      },
    ],
  });
}
