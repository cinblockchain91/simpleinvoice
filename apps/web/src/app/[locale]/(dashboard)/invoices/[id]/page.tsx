"use client";

import { use } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shadcn/ui/button";
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
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <span className="w-36 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations("invoices");
  const { data: invoice, isLoading, isError, error } = useInvoice(id);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{t("detail")}</h1>
      </div>

      {isLoading && (
        <div className="rounded-lg border p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full max-w-sm" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {(error as Error)?.message ?? "Failed to load invoice."}
        </div>
      )}

      {invoice && (
        <div className="rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {invoice.invoiceNumber}
            </span>
            <InvoiceStatusBadge status={invoice.status} />
          </div>

          <Separator />

          <div className="space-y-3">
            <DetailRow label="Customer" value={invoice.customerName} />
            <DetailRow
              label="Issue Date"
              value={formatDate(invoice.issueDate)}
            />
            <DetailRow label="Due Date" value={formatDate(invoice.dueDate)} />
            <DetailRow
              label="Sub Total"
              value={formatCurrency(invoice.subTotal, invoice.currency)}
            />
            <DetailRow
              label="Tax"
              value={formatCurrency(invoice.taxAmount, invoice.currency)}
            />
            <DetailRow
              label="Total Amount"
              value={
                <span className="text-base font-semibold">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
