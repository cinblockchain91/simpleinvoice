"use client";

import { useQuery } from "@tanstack/react-query";
import { bffFetch } from "@/shared/api/bff-client";
import type { ListInvoicesResponse } from "@/entities/invoice";
import type { InvoiceStatus } from "@/entities/invoice";

interface UseInvoiceListParams {
  page: number;
  pageSize: number;
  status?: InvoiceStatus | "ALL";
  keyword?: string;
}

export function useInvoiceList({
  page,
  pageSize,
  status,
  keyword,
}: UseInvoiceListParams) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status && status !== "ALL") params.set("status", status);
  if (keyword?.trim()) params.set("keyword", keyword.trim());

  return useQuery<ListInvoicesResponse>({
    queryKey: ["invoices", page, pageSize, status, keyword],
    queryFn: () => bffFetch<ListInvoicesResponse>(`/api/invoices?${params}`),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });
}
