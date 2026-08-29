import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import FilterPills from "@/components/admin/FilterPills";
import StatusBadge from "@/components/admin/StatusBadge";
import RoleSelect from "@/components/admin/RoleSelect";
import { listUsers, parseListParams } from "@/lib/admin/queries";
import { formatDate, getInitials } from "@/lib/utils";
import { mediaSrc } from "@/lib/admin/media";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string; filter?: string }>;
}) => {
  const params = parseListParams(await searchParams);
  const { rows, total, totalPages } = await listUsers(params);

  return (
    <section className="admin-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark-400">All Users</h2>
          <p className="text-sm text-light-500">{total} registered accounts</p>
        </div>
        <FilterPills
          value={params.filter}
          query={params.query}
          options={[
            { label: "All", value: "all" },
            { label: "Admins", value: "ADMIN" },
            { label: "Users", value: "USER" },
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
          ]}
        />
      </div>

      <div className="admin-table-wrap mt-7">
        {rows.length === 0 ? (
          <EmptyState
            title="No users found"
            description="Try another search or wait for students to create accounts."
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>University ID</th>
                <th>ID Card</th>
                <th>Date joined</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-light-300 font-semibold">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-dark-400">
                          {user.fullName}
                        </p>
                        <p className="truncate text-xs text-light-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>{user.universityId}</td>
                  <td>
                    {user.universityCard ? (
                      <a
                        href={mediaSrc(user.universityCard)}
                        target="_blank"
                        rel="noreferrer"
                        className="block size-12 overflow-hidden rounded-md border border-light-400"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mediaSrc(user.universityCard)}
                          alt={`${user.fullName} university card`}
                          className="size-full object-cover"
                        />
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <RoleSelect userId={user.id} role={user.role ?? "USER"} />
                  </td>
                  <td>
                    <StatusBadge value={user.status ?? "PENDING"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination
        page={params.page}
        totalPages={totalPages}
        query={params.query}
        filter={params.filter}
      />
    </section>
  );
};

export default Page;
