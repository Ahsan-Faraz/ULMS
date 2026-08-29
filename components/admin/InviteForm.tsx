"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { inviteStaff } from "@/lib/admin/actions/invite";
import { toast } from "@/hooks/use-toast";

const InviteForm = () => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-4 flex flex-col gap-3 sm:flex-row"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await inviteStaff(
          String(data.get("email") || ""),
          (data.get("role") as "ADMIN" | "LIBRARIAN") || "LIBRARIAN",
        );
        setPending(false);
        if (result.success) {
          toast({ title: "Invite sent" });
          event.currentTarget.reset();
          router.refresh();
        } else {
          toast({
            title: "Could not invite",
            description: result.message,
            variant: "destructive",
          });
        }
      }}
    >
      <Input
        name="email"
        type="email"
        required
        placeholder="staff@campus.edu"
        className="book-form_input"
      />
      <select
        name="role"
        className="h-14 rounded-xl border border-gray-100 bg-light-600 px-3 text-sm font-semibold"
        defaultValue="LIBRARIAN"
      >
        <option value="LIBRARIAN">Librarian</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button className="book-form_btn text-white sm:w-40" disabled={pending}>
        {pending ? "Sending..." : "Invite"}
      </Button>
    </form>
  );
};

export default InviteForm;
