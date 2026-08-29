"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { updateLibrarySettings } from "@/lib/admin/actions/settings";
import {
  enableProWithoutStripe,
  startProCheckout,
} from "@/lib/admin/actions/billing";

const SettingsForm = ({
  name,
  logoUrl,
  loanDays,
  emailFrom,
  plan,
  stripeReady,
}: {
  name: string;
  logoUrl: string | null;
  loanDays: number;
  emailFrom: string | null;
  plan: "FREE" | "PRO";
  stripeReady: boolean;
}) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-10">
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const result = await updateLibrarySettings({
            name: String(data.get("name") || ""),
            logoUrl: String(data.get("logoUrl") || "") || null,
            loanDays: Number(data.get("loanDays")),
            emailFrom: String(data.get("emailFrom") || "") || null,
          });
          setPending(false);
          if (result.success) {
            toast({ title: "Settings saved" });
            router.refresh();
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
          }
        }}
      >
        <label className="block text-sm font-medium text-dark-400">
          Library name
          <Input name="name" defaultValue={name} className="book-form_input mt-1" />
        </label>
        <label className="block text-sm font-medium text-dark-400">
          Logo URL
          <Input
            name="logoUrl"
            defaultValue={logoUrl ?? ""}
            className="book-form_input mt-1"
            placeholder="https://..."
          />
        </label>
        <label className="block text-sm font-medium text-dark-400">
          Loan length (days)
          <Input
            name="loanDays"
            type="number"
            min={1}
            max={60}
            defaultValue={loanDays}
            className="book-form_input mt-1"
          />
        </label>
        <label className="block text-sm font-medium text-dark-400">
          Email from
          <Input
            name="emailFrom"
            defaultValue={emailFrom ?? ""}
            className="book-form_input mt-1"
            placeholder="Libris Library <you@domain.com>"
          />
        </label>
        <p className="text-xs text-light-500">
          Custom name, logo, and sender show on Campus Pro. Loan days apply on
          every plan.
        </p>
        <Button className="book-form_btn text-white" disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
      </form>

      <div className="rounded-xl border border-light-400 p-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-light-500">
          Plan
        </p>
        <p className="mt-2 font-serif text-3xl text-dark-400">
          {plan === "PRO" ? "Campus Pro" : "Campus Free"}
        </p>
        {plan === "FREE" ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              className="bg-primary-admin text-white"
              type="button"
              onClick={async () => {
                const result = await startProCheckout();
                if (result.success && result.url) {
                  window.location.href = result.url;
                  return;
                }
                toast({
                  title: "Stripe",
                  description: result.message,
                  variant: "destructive",
                });
              }}
            >
              {stripeReady ? "Upgrade with Stripe — $19/mo" : "Stripe not configured"}
            </Button>
            {!stripeReady ? (
              <Button
                type="button"
                variant="outline"
                className="border-light-400"
                onClick={async () => {
                  const result = await enableProWithoutStripe();
                  if (result.success) {
                    toast({ title: "Campus Pro enabled" });
                    router.refresh();
                  } else {
                    toast({
                      title: "Error",
                      description: result.message,
                      variant: "destructive",
                    });
                  }
                }}
              >
                Enable Pro for development
              </Button>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-sm text-light-500">
            Holds, ISBN lookup, reminders, and custom branding are on.
          </p>
        )}
      </div>
    </div>
  );
};

export default SettingsForm;
