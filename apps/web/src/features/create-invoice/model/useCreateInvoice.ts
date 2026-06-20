"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { bffFetch, BffError } from "@/shared/api/bff-client";
import type { CreateInvoiceRequest } from "@simpleinvoice/api-contracts";
import type { Invoice } from "@/entities/invoice";

export function useCreateInvoice() {
  const t = useTranslations("createInvoice");
  const queryClient = useQueryClient();

  return useMutation<Invoice, BffError, CreateInvoiceRequest>({
    mutationFn: (data) =>
      bffFetch<Invoice>("/api/invoices", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(t("successMessage"));
    },
    onError: () => {
      toast.error(t("errorMessage"));
    },
  });
}
