"use client";

import { usePathname } from "@/i18n/navigation";
import { SidebarTrigger } from "@/shadcn/ui/sidebar";
import { Separator } from "@/shadcn/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/ui/breadcrumb";
import { Link } from "@/i18n/navigation";

function usePageBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (
    segments.length === 0 ||
    (segments.length === 1 && segments[0] === "invoices")
  ) {
    return { parent: null, current: "Invoices" };
  }

  if (segments[0] === "invoices" && segments[1] === "new") {
    return {
      parent: { label: "Invoices", href: "/invoices" as const },
      current: "New Invoice",
    };
  }

  if (segments[0] === "invoices" && segments[1]) {
    return {
      parent: { label: "Invoices", href: "/invoices" as const },
      current: "Invoice Detail",
    };
  }

  return { parent: null, current: segments[segments.length - 1] ?? "Home" };
}

export function DashboardHeader() {
  const { parent, current } = usePageBreadcrumb();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {parent && (
            <>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={parent.href}>{parent.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
            </>
          )}
          <BreadcrumbItem>
            <BreadcrumbPage>{current}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
