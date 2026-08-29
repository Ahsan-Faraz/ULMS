"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { checkoutForStudent } from "@/lib/admin/actions/borrow";
import { toast } from "@/hooks/use-toast";

const CheckoutForm = ({
  patrons,
  titles,
}: {
  patrons: { id: string; fullName: string; email: string }[];
  titles: { id: string; title: string; availableCopies: number }[];
}) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await checkoutForStudent({
          userId: String(data.get("userId") || ""),
          bookId: String(data.get("bookId") || ""),
        });
        setPending(false);
        if (result.success) {
          toast({ title: "Checked out" });
          router.refresh();
        } else {
          toast({
            title: "Could not check out",
            description: result.message,
            variant: "destructive",
          });
        }
      }}
    >
      <label className="block text-sm font-medium text-dark-400">
        Student
        <select
          name="userId"
          required
          className="mt-1 h-14 w-full rounded-xl border border-gray-100 bg-light-600 px-3 text-sm"
        >
          <option value="">Select a student</option>
          {patrons.map((patron) => (
            <option key={patron.id} value={patron.id}>
              {patron.fullName} · {patron.email}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-dark-400">
        Book
        <select
          name="bookId"
          required
          className="mt-1 h-14 w-full rounded-xl border border-gray-100 bg-light-600 px-3 text-sm"
        >
          <option value="">Select a title</option>
          {titles.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} · {book.availableCopies} available
            </option>
          ))}
        </select>
      </label>
      <Button className="book-form_btn text-white" disabled={pending}>
        {pending ? "Checking out..." : "Check out"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
