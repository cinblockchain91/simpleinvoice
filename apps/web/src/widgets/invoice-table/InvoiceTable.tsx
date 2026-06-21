"use client";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { InvoiceStatusBadge } from "@/entities/invoice";
import type { Invoice } from "@/entities/invoice";
import { invoiceQueryOptions } from "@/features/view-invoice";

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onRowClick?: (id: string) => void;
}

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

export function InvoiceTable({
  invoices,
  isLoading = false,
  onRowClick,
}: InvoiceTableProps) {
  const t = useTranslations("invoices");
  const queryClient = useQueryClient();

  const COLUMNS = [
    t("columns.invoiceNumber"),
    t("columns.customer"),
    t("columns.issueDate"),
    t("columns.dueDate"),
    t("columns.amount"),
    t("columns.status"),
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {COLUMNS.map((col) => (
                  <TableCell key={col}>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : invoices.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="h-32 text-center text-muted-foreground"
              >
                {t("empty")}
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={() => onRowClick?.(invoice.id)}
                onMouseEnter={() =>
                  queryClient.prefetchQuery(invoiceQueryOptions(invoice.id))
                }
              >
                <TableCell className="font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </TableCell>
                <TableCell>
                  <InvoiceStatusBadge status={invoice.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
