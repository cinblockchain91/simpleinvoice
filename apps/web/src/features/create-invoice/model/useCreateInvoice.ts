"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bffFetch, BffError } from "@/shared/api/bff-client";
import type { CreateInvoiceRequest, Invoice } from "@/entities/invoice";

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation<Invoice, BffError, CreateInvoiceRequest>({
    mutationFn: (data) =>
      bffFetch<Invoice>("/api/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
