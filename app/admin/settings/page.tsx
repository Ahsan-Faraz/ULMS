import { requireAdmin } from "@/lib/admin/guard";
import { redirect } from "next/navigation";
import { getLibrarySettings } from "@/lib/settings";
import { listInvites } from "@/lib/admin/actions/invite";
import SettingsForm from "@/components/admin/SettingsForm";
import InviteForm from "@/components/admin/InviteForm";
import { stripeEnabled } from "@/lib/stripe";
import { formatDate } from "@/lib/utils";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) => {
  const admin = await requireAdmin();
  if (!admin.ok) redirect("/admin");

  const settings = await getLibrarySettings();
  const invites = await listInvites();
  const billing = (await searchParams).billing;

  return (
    <section className="admin-panel max-w-3xl">
      <h2 className="text-xl font-semibold text-dark-400">Library settings</h2>
      <p className="mt-1 text-sm text-light-500">
        Loan length, branding, billing, and staff invites.
      </p>
      {billing === "success" ? (
        <p className="mt-4 rounded-lg bg-green-100 px-4 py-3 text-sm text-green-800">
          Stripe checkout completed. Pro unlocks after the webhook confirms
          payment.
        </p>
      ) : null}

      <div className="mt-8">
        <SettingsForm
          name={settings.name}
          logoUrl={settings.logoUrl}
          loanDays={settings.loanDays}
          emailFrom={settings.emailFrom}
          plan={settings.plan}
          stripeReady={stripeEnabled}
        />
      </div>

      <div className="mt-12">
        <h3 className="text-lg font-semibold text-dark-400">Invite staff</h3>
        <p className="mt-1 text-sm text-light-500">
          Librarians can manage books and circulation. Admins can also manage
          users, billing, and invites.
        </p>
        <InviteForm />
        {invites.length > 0 ? (
          <ul className="mt-6 space-y-2 text-sm">
            {invites.map((invite) => (
              <li key={invite.id} className="text-dark-400">
                {invite.email} · {invite.role} · expires {formatDate(invite.expiresAt)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default Page;
