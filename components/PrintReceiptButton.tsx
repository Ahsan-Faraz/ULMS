"use client";

import { Button } from "@/components/ui/button";

const PrintReceiptButton = () => {
  return (
    <Button
      className="no-print bg-primary text-white hover:bg-primary/90"
      onClick={() => window.print()}
    >
      Print or save PDF
    </Button>
  );
};

export default PrintReceiptButton;
