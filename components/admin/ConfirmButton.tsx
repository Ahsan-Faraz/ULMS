"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Tone = "success" | "danger" | "neutral";

const ConfirmButton = ({
  label,
  title,
  description,
  confirmText,
  tone = "neutral",
  action,
  redirectTo,
  className,
}: {
  label: string;
  title: string;
  description: string;
  confirmText: string;
  tone?: Tone;
  action: () => Promise<{ success: boolean; message?: string }>;
  redirectTo?: string;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const confirmClass =
    tone === "success"
      ? "bg-green-800 hover:bg-green-800/90"
      : tone === "danger"
        ? "bg-red-800 hover:bg-red-800/90"
        : "bg-primary-admin hover:bg-primary-admin/90";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-lg px-3 py-2 text-xs font-semibold",
          tone === "success" && "bg-[#ECFDF3] text-[#027A48]",
          tone === "danger" && "bg-[#FFF1F3] text-[#C01048]",
          tone === "neutral" && "bg-light-300 text-primary-admin",
          className,
        )}
      >
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <div
              className={cn(
                "confirm-illustration mb-4",
                tone === "danger" ? "bg-red-100" : "bg-green-100",
              )}
            >
              <div className={tone === "danger" ? "bg-red-800" : "bg-green-800"} />
            </div>
            <h3 className="text-xl font-semibold text-dark-400">{title}</h3>
            <p className="mt-2 text-sm text-light-500">{description}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await action();
                    if (result.success) {
                      toast({ title: "Success", description: confirmText });
                      setOpen(false);
                      if (redirectTo) router.push(redirectTo);
                      else router.refresh();
                    } else {
                      toast({
                        title: "Error",
                        description: result.message ?? "Something went wrong",
                        variant: "destructive",
                      });
                    }
                  });
                }}
                className={cn(
                  "confirm-btn text-white disabled:opacity-60",
                  confirmClass,
                )}
              >
                {pending ? "Please wait..." : confirmText}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm font-semibold text-light-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmButton;
