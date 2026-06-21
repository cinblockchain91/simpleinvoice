import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/shadcn/ui/button";
import { Skeleton } from "@/shadcn/ui/skeleton";
import { InvoiceDetailContent } from "./InvoiceDetailContent";

function InvoiceDetailFallback() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-5 w-full max-w-sm" />
      ))}
    </div>
  );
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("invoices");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{t("detailTitle")}</h1>
      </div>

      <Suspense fallback={<InvoiceDetailFallback />}>
        <InvoiceDetailContent id={id} />
      </Suspense>
    </div>
  );
}
