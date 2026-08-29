"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { acceptStaffInvite } from "@/lib/admin/actions/invite";
import { signInWithCredentials } from "@/lib/actions/auth";
import { toast } from "@/hooks/use-toast";

const AcceptInviteForm = ({ token }: { token: string }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const fullName = String(data.get("fullName") || "");
        const password = String(data.get("password") || "");
        setPending(true);
        const result = await acceptStaffInvite({ token, fullName, password });
        if (!result.success || !result.email) {
          toast({
            title: "Invite failed",
            description: result.error,
            variant: "destructive",
          });
          setPending(false);
          return;
        }

        await signInWithCredentials({ email: result.email, password });
        router.push("/admin");
      }}
    >
      <Input name="fullName" required placeholder="Full name" className="form-input" />
      <Input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Password"
        className="form-input"
      />
      <Button className="form-btn" disabled={pending}>
        {pending ? "Creating account..." : "Accept invite"}
      </Button>
    </form>
  );
};

export default AcceptInviteForm;
