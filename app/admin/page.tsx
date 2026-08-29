import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import BookCover from "@/components/BookCover";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/admin/StatusBadge";
import EmptyState from "@/components/admin/EmptyState";
import {
  getAdminStats,
  getRecentBooks,
  getRecentBorrows,
  listAccountRequests,
} from "@/lib/admin/queries";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Page = async () => {
  const [stats, latestBooks, accountRequests, latestBorrows] = await Promise.all([
    getAdminStats(),
    getRecentBooks(5),
    listAccountRequests({ query: "", page: 1 }),
    getRecentBorrows(4),
  ]);
  const pendingUsers = accountRequests.rows.slice(0, 6);

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Borrowed books"
          value={stats.borrowed}
          hint={stats.overdue ? `${stats.overdue} overdue` : "All on time"}
        />
        <StatCard
          label="Total users"
          value={stats.users}
          hint={stats.newUsers ? `+${stats.newUsers} this week` : undefined}
        />
        <StatCard
          label="Total books"
          value={stats.books}
          hint={stats.newBooks ? `+${stats.newBooks} this week` : undefined}
        />
        <StatCard label="Pending accounts" value={stats.pending} />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="admin-panel">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-dark-400">
              Borrow requests
            </h2>
            <Link href="/admin/book-requests" className="view-btn px-4 py-2">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {latestBorrows.length === 0 ? (
              <EmptyState
                title="No borrow activity yet"
                description="When students borrow books, those requests will show up here."
              />
            ) : (
              latestBorrows.map((record) => (
                <article key={record.id} className="book-stripe">
                  <BookCover
                    variant="extraSmall"
                    coverColor={record.coverColor}
                    coverImage={record.coverUrl}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="title">{record.bookTitle}</p>
                    <div className="author">
                      <p>{record.author}</p>
                      <div />
                      <p>{record.genre}</p>
                    </div>
                    <div className="user">
                      <div className="avatar">
                        <Avatar className="size-5">
                          <AvatarFallback className="bg-white text-[10px]">
                            {getInitials(record.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <p>{record.userName}</p>
                      </div>
                      <div className="borrow-date">
                        <Image
                          src="/icons/calendar.svg"
                          alt=""
                          width={14}
                          height={14}
                        />
                        <p>{formatDate(record.borrowDate)}</p>
                      </div>
                    </div>
                  </div>
                  <StatusBadge value={record.status} />
                </article>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-panel">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-dark-400">
                Account requests
              </h2>
              <Link
                href="/admin/account-requests"
                className="view-btn px-4 py-2"
              >
                View all
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pendingUsers.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    title="No pending accounts"
                    description="New student sign-ups waiting for approval will appear here."
                  />
                </div>
              ) : (
                pendingUsers.map((user) => (
                    <article key={user.id} className="user-card w-full">
                      <Avatar className="size-12">
                        <AvatarFallback className="bg-white font-semibold">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="name">{user.fullName}</p>
                      <p className="email">{user.email}</p>
                    </article>
                  ))
              )}
            </div>
          </div>

          <Link href="/admin/books/new" className="add-new-book_btn">
            <div>
              <Plus className="size-5 text-primary-admin" />
            </div>
            <div>
              <p>Add New Book</p>
              <p className="text-sm text-light-500">
                Create a title, cover, and inventory in minutes.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="admin-panel">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-dark-400">
            Recently added books
          </h2>
          <Link href="/admin/books" className="view-btn px-4 py-2">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
          {latestBooks.map((book) => (
            <Link
              key={book.id}
              href={`/admin/books/${book.id}`}
              className="book-stripe"
            >
              <BookCover
                variant="small"
                coverColor={book.coverColor}
                coverImage={book.coverUrl}
              />
              <div className="min-w-0">
                <p className="title">{book.title}</p>
                <div className="author">
                  <p>{book.author}</p>
                  <div />
                  <p>{book.genre}</p>
                </div>
                <p className="mt-2 text-xs text-light-500">
                  {book.availableCopies}/{book.totalCopies} available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;
