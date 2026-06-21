"use client";

import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/shadcn/ui/button";
import { CreateInvoiceForm, useCreateInvoice } from "@/features/create-invoice";

export default function NewInvoicePage() {
  const t = useTranslations("createInvoice");
  const router = useRouter();
  const { mutateAsync, isPending, error } = useCreateInvoice();

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
      </div>

      <CreateInvoiceForm
        onSubmit={async (data) => {
          await mutateAsync(data);
          router.push("/invoices");
        }}
        isLoading={isPending}
        error={error?.message ?? null}
      />
    </div>
  );
}
