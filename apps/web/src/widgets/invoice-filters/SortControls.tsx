"use client";

import { useTranslations } from "next-intl";
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
  const t = useTranslations("invoices");

  const SORT_OPTIONS: { value: SortField; label: string }[] = [
    { value: "issueDate", label: t("columns.issueDate") },
    { value: "dueDate", label: t("columns.dueDate") },
    { value: "totalAmount", label: t("columns.amount") },
    { value: "invoiceNumber", label: t("columns.invoiceNumber") },
  ];

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
        aria-label={t(order === "asc" ? "sort.descending" : "sort.ascending")}
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
