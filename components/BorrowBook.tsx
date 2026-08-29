"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { borrowBook } from "@/lib/actions/book";
import { placeHold } from "@/lib/actions/hold";

interface Props {
  userId: string;
  bookId: string;
  action: "borrow" | "hold" | "ready" | "blocked";
  message?: string;
  holdIsPro?: boolean;
}

const BorrowBook = ({
  bookId,
  userId,
  action,
  message,
  holdIsPro = true,
}: Props) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const run = async () => {
    if (action === "blocked") {
      toast({
        title: "Not available",
        description: message,
        variant: "destructive",
      });
      return;
    }

    setPending(true);
    try {
      if (action === "hold") {
        if (!holdIsPro) {
          toast({
            title: "Campus Pro",
            description: "Holds are included with Campus Pro.",
          });
          router.push("/pricing");
          return;
        }

        const result = await placeHold(bookId);
        if (result.success) {
          toast({ title: "Hold placed", description: "We will email you when a copy is ready." });
          router.refresh();
        } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
        }
        return;
      }

      const result = await borrowBook({ bookId, userId });
      if (result.success) {
        toast({ title: "Success", description: "Book borrowed successfully" });
        router.push("/my-profile");
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    } finally {
      setPending(false);
    }
  };

  const label =
    action === "hold"
      ? pending
        ? "Placing hold..."
        : "Place hold"
      : action === "ready"
        ? pending
          ? "Borrowing..."
          : "Borrow reserved copy"
        : pending
          ? "Borrowing..."
          : "Borrow book";

  return (
    <Button
      className="book-overview_btn"
      onClick={run}
      disabled={pending || action === "blocked"}
    >
      <Image
        src="/icons/book.svg"
        alt="book"
        width={20}
        height={20}
        className="brightness-0 invert"
      />
      <p className="font-serif text-xl text-white">{label}</p>
    </Button>
  );
};
export default BorrowBook;
