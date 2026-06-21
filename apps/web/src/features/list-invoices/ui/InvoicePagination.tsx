"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/shadcn/ui/pagination";

interface InvoicePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function InvoicePagination({
  page,
  totalPages,
  onPageChange,
}: InvoicePaginationProps) {
  const t = useTranslations("common");

  if (totalPages <= 1) return null;

  const pages = buildPageRange(page, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            href="#"
            size="default"
            aria-label={t("previous")}
            aria-disabled={page <= 1}
            className={`gap-1 pl-2.5 ${page <= 1 ? "pointer-events-none opacity-50" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              if (page > 1) onPageChange(page - 1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("previous")}</span>
          </PaginationLink>
        </PaginationItem>

        {pages.map((p, i) =>
          p === "…" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href="#"
                isActive={p === page}
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(p as number);
                }}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationLink
            href="#"
            size="default"
            aria-label={t("next")}
            aria-disabled={page >= totalPages}
            className={`gap-1 pr-2.5 ${page >= totalPages ? "pointer-events-none opacity-50" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              if (page < totalPages) onPageChange(page + 1);
            }}
          >
            <span className="hidden sm:inline">{t("next")}</span>
            <ChevronRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
