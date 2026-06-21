"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shadcn/ui/select";
import type { InvoiceStatus } from "@/entities/invoice";

const STATUS_VALUES: (InvoiceStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "VOID",
];

interface FilterBarProps {
  status: InvoiceStatus | "ALL";
  onStatusChange: (status: InvoiceStatus | "ALL") => void;
}

export function FilterBar({ status, onStatusChange }: FilterBarProps) {
  const t = useTranslations("invoices");
  const tStatus = useTranslations("common");

  const statusLabel = (value: InvoiceStatus | "ALL") =>
    value === "ALL" ? t("filters.allStatuses") : tStatus(`status.${value}`);

  return (
    <div className="flex items-center gap-3">
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as InvoiceStatus | "ALL")}
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder={t("filters.statusPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          {STATUS_VALUES.map((val) => (
            <SelectItem key={val} value={val}>
              {statusLabel(val)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
