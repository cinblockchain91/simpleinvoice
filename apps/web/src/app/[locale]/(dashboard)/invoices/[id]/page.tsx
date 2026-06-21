"use client";

import { use } from "react";
import { ArrowLeft, Calendar, DollarSign, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shadcn/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card";
import { Separator } from "@/shadcn/ui/separator";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { InvoiceStatusBadge } from "@/entities/invoice";
import { useInvoiceDetail } from "@/features/invoice-detail";

interface Props {
  params: Promise<{ id: string }>;
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

function DetailSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

export default function InvoiceDetailPage({ params }: Props) {
  const { id } = use(params);
  const t = useTranslations();
  const { data: invoice, isLoading, isError } = useInvoiceDetail(id);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !invoice) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/invoices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-6 text-sm text-destructive">
          Invoice not found or failed to load.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.back")}
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{invoice.invoiceNumber}</h1>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="font-semibold">{invoice.customerName}</p>
            <p className="text-sm text-muted-foreground">
              ID: {invoice.customerId}
            </p>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Issue Date</span>
              <span className="font-medium">
                {formatDate(invoice.issueDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due Date</span>
              <span className="font-medium">{formatDate(invoice.dueDate)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Amounts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(invoice.subTotal, invoice.currency)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg">
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
