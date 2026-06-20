"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import type { InvoiceStatus } from "@/entities/invoice";

const STATUS_OPTIONS: { value: InvoiceStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "VOID", label: "Void" },
];

interface FilterBarProps {
  status: InvoiceStatus | "ALL";
  onStatusChange: (status: InvoiceStatus | "ALL") => void;
}

export function FilterBar({ status, onStatusChange }: FilterBarProps) {
  return (
    <div className="flex items-center gap-3">
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as InvoiceStatus | "ALL")}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
