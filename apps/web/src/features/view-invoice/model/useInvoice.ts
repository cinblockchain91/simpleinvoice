"use client";

import { useQuery, queryOptions } from "@tanstack/react-query";
import { bffFetch, BffError } from "@/shared/api/bff-client";
import type { Invoice } from "@/entities/invoice";

export const invoiceQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["invoice", id],
    queryFn: () => bffFetch<Invoice>(`/api/invoices/${id}`),
    staleTime: 60_000,
    retry: (failureCount, error) => {
      if (error instanceof BffError && error.status === 404) return false;
      return failureCount < 2;
    },
  });

export function useInvoice(id: string) {
  return useQuery(invoiceQueryOptions(id));
}
