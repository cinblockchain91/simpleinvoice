import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PlusIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shadcn/ui/button";
import { InvoiceListContent } from "./InvoiceListContent";

function InvoiceListFallback() {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="h-9 w-48 rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="rounded-md border overflow-hidden">
        <div className="h-10 border-b bg-muted/50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b last:border-0">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
            <div className="h-4 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function InvoicesPage() {
  const t = await getTranslations("invoices");

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

      <Suspense fallback={<InvoiceListFallback />}>
        <InvoiceListContent />
      </Suspense>
    </div>
  );
}
