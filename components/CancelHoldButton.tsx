"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelHold } from "@/lib/actions/hold";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const CancelHoldButton = ({ holdId }: { holdId: string }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      className="border-light-400"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const result = await cancelHold(holdId);
        if (result.success) {
          toast({ title: "Hold cancelled" });
          router.refresh();
        } else {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          });
        }
        setPending(false);
      }}
    >
      {pending ? "Cancelling..." : "Cancel hold"}
    </Button>
  );
};

export default CancelHoldButton;
