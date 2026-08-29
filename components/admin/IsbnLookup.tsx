"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const IsbnLookup = ({
  enabled,
  onFound,
}: {
  enabled: boolean;
  onFound: (book: {
    title: string;
    author: string;
    description: string;
    summary: string;
    coverUrl: string;
    genre: string;
    isbn: string;
  }) => void;
}) => {
  const [isbn, setIsbn] = useState("");
  const [pending, setPending] = useState(false);

  if (!enabled) {
    return (
      <p className="text-sm text-light-500">
        ISBN autofill is included with Campus Pro.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={isbn}
        onChange={(event) => setIsbn(event.target.value)}
        placeholder="ISBN"
        className="book-form_input"
      />
      <Button
        type="button"
        className="book-form_btn text-white sm:w-40"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const response = await fetch(`/api/isbn?isbn=${encodeURIComponent(isbn)}`);
          const data = await response.json();
          if (!response.ok) {
            toast({
              title: "ISBN lookup failed",
              description: data.error,
              variant: "destructive",
            });
          } else {
            onFound(data);
            toast({ title: "Details filled from Open Library" });
          }
          setPending(false);
        }}
      >
        {pending ? "Looking up..." : "Lookup ISBN"}
      </Button>
    </div>
  );
};

export default IsbnLookup;
