import BookCover from "@/components/BookCover";
import EmptyState from "@/components/admin/EmptyState";
import Pagination from "@/components/admin/Pagination";
import FilterPills from "@/components/admin/FilterPills";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { listBorrowRequests, parseListParams } from "@/lib/admin/queries";
import { markBorrowReturned } from "@/lib/admin/actions/borrow";
import { formatDate } from "@/lib/utils";
import dayjs from "dayjs";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string; filter?: string }>;
}) => {
  const params = parseListParams(await searchParams);
  const { rows, total, totalPages } = await listBorrowRequests(params);
  const today = dayjs().format("YYYY-MM-DD");

  return (
    <section className="admin-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dark-400">Borrow Requests</h2>
          <p className="text-sm text-light-500">{total} records</p>
        </div>
        <FilterPills
          value={params.filter}
          query={params.query}
          options={[
            { label: "All", value: "all" },
            { label: "Borrowed", value: "BORROWED" },
            { label: "Overdue", value: "OVERDUE" },
            { label: "Returned", value: "RETURNED" },
          ]}
        />
      </div>

      <div className="admin-table-wrap mt-7">
        {rows.length === 0 ? (
          <EmptyState
            title="No borrow records"
            description="Student borrows will appear here with due dates and return actions."
          />
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Student</th>
                <th>Borrowed</th>
                <th>Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((record) => {
                const overdue =
                  record.status === "BORROWED" && record.dueDate < today;

                return (
                  <tr key={record.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <BookCover
                          variant="extraSmall"
                          coverColor={record.coverColor}
                          coverImage={record.coverUrl}
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-dark-400">
                            {record.bookTitle}
                          </p>
                          <p className="text-xs text-light-500">
                            {record.author}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="font-medium">{record.userName}</p>
                      <p className="text-xs text-light-500">{record.userEmail}</p>
                    </td>
                    <td>{formatDate(record.borrowDate)}</td>
                    <td>{formatDate(record.dueDate)}</td>
                    <td>
                      <StatusBadge
                        value={overdue ? "OVERDUE" : record.status}
                      />
                    </td>
                    <td>
                      {record.status === "BORROWED" ? (
                        <ConfirmButton
                          label="Mark returned"
                          title="Mark this book as returned?"
                          description={`${record.userName} will no longer have ${record.bookTitle} on loan.`}
                          confirmText="Mark returned"
                          tone="success"
                          action={async () => {
                            "use server";
                            return markBorrowReturned(record.id);
                          }}
                        />
                      ) : (
                        <span className="text-xs text-light-500">
                          Returned {formatDate(record.returnDate)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
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
