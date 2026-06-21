"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PlusIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shadcn/ui/button";
import { InvoiceTable } from "@/widgets/invoice-table";
import { FilterBar } from "@/widgets/invoice-filters";
import { SortControls } from "@/widgets/invoice-filters";
import type { SortField, SortOrder } from "@/widgets/invoice-filters";
import { SearchBar } from "@/features/search-invoices";
import { useInvoiceSearch } from "@/features/search-invoices";
import {
  useInvoiceList,
  useInvoicePagination,
  InvoicePagination,
} from "@/features/list-invoices";
import type { InvoiceStatus } from "@/entities/invoice";

export default function InvoicesPage() {
  const t = useTranslations("invoices");

  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortField>("issueDate");
  const [order, setOrder] = useState<SortOrder>("desc");

  const { keyword, debouncedKeyword, setKeyword } = useInvoiceSearch();
  const { page, pageSize, setPage } = useInvoicePagination();

  const { data, isLoading, isError } = useInvoiceList({
    page,
    pageSize,
    status,
    keyword: debouncedKeyword,
  });

  const invoices = data?.data ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / pageSize) || 1;

  const sorted = [...invoices].sort((a, b) => {
    const av = a[sortBy as keyof typeof a] as string | number;
    const bv = b[sortBy as keyof typeof b] as string | number;
    if (av < bv) return order === "asc" ? -1 : 1;
    if (av > bv) return order === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button asChild className="h-[35px] w-fit">
          <Link href="/invoices/new">
            <PlusIcon className="mr-2 h-4 w-4" />
            {t("createInvoice")}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar value={keyword} onChange={setKeyword} />
        <FilterBar status={status} onStatusChange={setStatus} />
        <SortControls
          sortBy={sortBy}
          order={order}
          onSortByChange={setSortBy}
          onOrderChange={setOrder}
        />
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load invoices. Please try again.
        </div>
      ) : (
        <>
          <InvoiceTable invoices={sorted} isLoading={isLoading} />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {total} invoice{total !== 1 ? "s" : ""} total
            </span>
            <InvoicePagination
              page={page}
              totalPages={pages}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
