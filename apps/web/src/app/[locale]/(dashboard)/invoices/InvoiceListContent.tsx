"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { InvoiceTable } from "@/widgets/invoice-table";
import { FilterBar, SortControls } from "@/widgets/invoice-filters";
import type { SortField, SortOrder } from "@/widgets/invoice-filters";
import { SearchBar, useInvoiceSearch } from "@/features/search-invoices";
import {
  useInvoiceList,
  useInvoicePagination,
  InvoicePagination,
} from "@/features/list-invoices";
import type { InvoiceStatus } from "@/entities/invoice";

export function InvoiceListContent() {
  const router = useRouter();

  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [sortBy, setSortBy] = useState<SortField>("issueDate");
  const [order, setOrder] = useState<SortOrder>("desc");

  const { keyword, debouncedKeyword, setKeyword, isPending } =
    useInvoiceSearch();
  const { page, pageSize, setPage } = useInvoicePagination();

  const { data, isLoading, isFetching, isError } = useInvoiceList({
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
    <>
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
          <InvoiceTable
            invoices={sorted}
            isLoading={isLoading || isPending || isFetching}
            onRowClick={(id) => router.push(`/invoices/${id}`)}
          />
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
    </>
  );
}
