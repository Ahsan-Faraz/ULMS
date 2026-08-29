"use server";

import { requireAdmin } from "@/lib/admin/guard";
import { createProCheckout, stripeEnabled } from "@/lib/stripe";
import { setPlan } from "@/lib/admin/actions/settings";

export const startProCheckout = async () => {
  const admin = await requireAdmin();
  if (!admin.ok) return { success: false, message: admin.error };

  if (!stripeEnabled) {
    return { success: false, message: "Add STRIPE_SECRET_KEY to enable Checkout." };
  }

  const session = await createProCheckout();
  if (!session?.url) {
    return { success: false, message: "Could not start Stripe Checkout." };
  }

  return { success: true, url: session.url };
};

export const enableProWithoutStripe = async () => {
  if (process.env.STRIPE_SECRET_KEY && process.env.NODE_ENV === "production") {
    return {
      success: false,
      message: "Use Stripe Checkout in production.",
    };
  }

  return setPlan("PRO");
};
