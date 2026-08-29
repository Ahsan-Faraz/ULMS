"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { renewBorrow } from "@/lib/actions/renew";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const RenewButton = ({
  borrowId,
  disabled,
}: {
  borrowId: string;
  disabled?: boolean;
}) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      className="border-light-400"
      disabled={disabled || pending}
      onClick={async () => {
        setPending(true);
        const result = await renewBorrow(borrowId);
        if (result.success) {
          toast({ title: "Renewed", description: `New due date: ${result.dueDate}` });
          router.refresh();
        } else {
          toast({
            title: "Could not renew",
            description: result.error,
            variant: "destructive",
          });
        }
        setPending(false);
      }}
    >
      {pending ? "Renewing..." : "Renew"}
    </Button>
  );
};

export default RenewButton;
