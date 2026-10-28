"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary">
      <Printer className="size-4" /> Print or save as PDF
    </button>
  );
}
