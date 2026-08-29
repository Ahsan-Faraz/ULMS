"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { updateUserRole } from "@/lib/admin/actions/user";

const RoleSelect = ({
  userId,
  role,
}: {
  userId: string;
  role: "USER" | "ADMIN";
}) => {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      defaultValue={role}
      disabled={pending}
      onChange={(event) => {
        const nextRole = event.target.value as "USER" | "ADMIN";
        startTransition(async () => {
          const result = await updateUserRole(userId, nextRole);
          if (result.success) {
            toast({ title: "Role updated" });
            router.refresh();
          } else {
            toast({
              title: "Error",
              description: result.message,
              variant: "destructive",
            });
            event.target.value = role;
          }
        });
      }}
      className="rounded-lg border border-light-400 bg-light-600 px-3 py-2 text-xs font-semibold text-dark-400 outline-none"
    >
      <option value="USER">User</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
};

export default RoleSelect;
