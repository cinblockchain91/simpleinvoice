"use client";

import {
  User,
  CalendarDays,
  CalendarCheck2,
  Receipt,
  Percent,
  CreditCard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { Separator } from "@/shadcn/ui/separator";
import { InvoiceStatusBadge } from "@/entities/invoice";
import { useInvoice } from "@/features/view-invoice";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DetailRow({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 items-center py-3 border-b last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        <span>{label}</span>
      </div>
      <span
        className={
          highlight ? "text-base font-semibold" : "text-sm font-medium"
        }
      >
        {value}
      </span>
    </div>
  );
}

export function InvoiceDetailContent({ id }: { id: string }) {
  const t = useTranslations("invoices");
  const { data: invoice, isLoading, isError, error } = useInvoice(id);

  if (isLoading) {
    return (
      <div className="rounded-lg border p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full max-w-sm" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        {(error as Error)?.message ?? t("detail.loadError")}
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 bg-muted/30">
        <span className="text-lg font-semibold">{invoice.invoiceNumber}</span>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <Separator />

      <div className="px-6">
        <DetailRow
          icon={User}
          label={t("detail.customer")}
          value={invoice.customerName}
        />
        <DetailRow
          icon={CalendarDays}
          label={t("detail.issueDate")}
          value={formatDate(invoice.issueDate)}
        />
        <DetailRow
          icon={CalendarCheck2}
          label={t("detail.dueDate")}
          value={formatDate(invoice.dueDate)}
        />
        <DetailRow
          icon={Receipt}
          label={t("detail.subTotal")}
          value={formatCurrency(invoice.subTotal, invoice.currency)}
        />
        <DetailRow
          icon={Percent}
          label={t("detail.tax")}
          value={formatCurrency(invoice.taxAmount, invoice.currency)}
        />
        <DetailRow
          icon={CreditCard}
          label={t("detail.totalAmount")}
          value={formatCurrency(invoice.totalAmount, invoice.currency)}
          highlight
        />
      </div>
    </div>
  );
}
