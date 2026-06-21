"use client";

import { useQuery } from "@tanstack/react-query";
import { bffFetch, BffError } from "@/shared/api/bff-client";
import type { Invoice } from "@/entities/invoice";

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ["invoice", id],
    queryFn: () => bffFetch<Invoice>(`/api/invoices/${id}`),
    retry: (failureCount, error) => {
      if (error instanceof BffError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}
