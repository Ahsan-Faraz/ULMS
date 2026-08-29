import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { listAccountRequests, parseListParams } from "@/lib/admin/queries";
import { updateAccountStatus } from "@/lib/admin/actions/user";
import { formatDate, getInitials } from "@/lib/utils";
import { mediaSrc } from "@/lib/admin/media";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) => {
  const params = parseListParams(await searchParams);
  const { rows, total, totalPages } = await listAccountRequests(params);

  return (
    <section className="admin-panel">
      <div>
        <h2 className="text-xl font-semibold text-dark-400">Account Requests</h2>
        <p className="text-sm text-light-500">
          {total} students waiting for access
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No pending requests"
            description="Approved and rejected accounts live in All Users. New sign-ups will land here first."
          />
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((user) => (
            <article
              key={user.id}
              className="flex flex-col rounded-2xl bg-light-300 p-5"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-white font-semibold">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-dark-400">{user.fullName}</p>
                  <p className="truncate text-sm text-light-500">{user.email}</p>
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-light-500">University ID</dt>
                  <dd className="font-semibold text-dark-400">
                    {user.universityId}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-light-500">Requested</dt>
                  <dd className="font-semibold text-dark-400">
                    {formatDate(user.createdAt)}
                  </dd>
                </div>
              </dl>

              {user.universityCard ? (
                <a
                  href={mediaSrc(user.universityCard)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 overflow-hidden rounded-xl border border-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc(user.universityCard)}
                    alt="University ID card"
                    className="h-40 w-full object-cover"
                  />
                </a>
              ) : null}

              <div className="mt-4 flex gap-2">
                <ConfirmButton
                  label="Approve"
                  title={`Approve ${user.fullName}?`}
                  description="They will be able to borrow books after approval."
                  confirmText="Approve account"
                  tone="success"
                  className="flex-1"
                  action={async () => {
                    "use server";
                    return updateAccountStatus(user.id, "APPROVED");
                  }}
                />
                <ConfirmButton
                  label="Deny"
                  title={`Deny ${user.fullName}?`}
                  description="This request will be marked as rejected."
                  confirmText="Deny request"
                  tone="danger"
                  className="flex-1"
                  action={async () => {
                    "use server";
                    return updateAccountStatus(user.id, "REJECTED");
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Pagination page={params.page} totalPages={totalPages} query={params.query} />
    </section>
  );
};

export default Page;
