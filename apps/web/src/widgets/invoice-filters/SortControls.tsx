"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import { Button } from "@/shadcn/ui/button";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

export type SortField =
  | "issueDate"
  | "dueDate"
  | "totalAmount"
  | "invoiceNumber";
export type SortOrder = "asc" | "desc";

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "issueDate", label: "Issue Date" },
  { value: "dueDate", label: "Due Date" },
  { value: "totalAmount", label: "Amount" },
  { value: "invoiceNumber", label: "Invoice #" },
];

interface SortControlsProps {
  sortBy: SortField;
  order: SortOrder;
  onSortByChange: (field: SortField) => void;
  onOrderChange: (order: SortOrder) => void;
}

export function SortControls({
  sortBy,
  order,
  onSortByChange,
  onOrderChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={sortBy}
        onValueChange={(v) => onSortByChange(v as SortField)}
      >
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOrderChange(order === "asc" ? "desc" : "asc")}
        aria-label={`Sort ${order === "asc" ? "descending" : "ascending"}`}
      >
        {order === "asc" ? (
          <ArrowUpIcon className="h-4 w-4" />
        ) : (
          <ArrowDownIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
