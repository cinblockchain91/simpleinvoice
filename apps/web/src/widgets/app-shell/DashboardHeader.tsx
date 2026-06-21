"use client";

import { PanelLeft } from "lucide-react";
import { usePathname, Link } from "@/i18n/navigation";
import { Separator } from "@/shadcn/ui/separator";
import { Button } from "@/shadcn/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shadcn/ui/breadcrumb";
import { ThemeToggle } from "@/shared/ui";
import { LanguageSwitcher } from "./LanguageSwitcher";

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

interface DashboardHeaderProps {
  onToggle: () => void;
}

export function DashboardHeader({ onToggle }: DashboardHeaderProps) {
  const { parent, current } = usePageBreadcrumb();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={onToggle}
      >
        <PanelLeft className="size-4" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
      <Separator orientation="vertical" className="h-4" />
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
      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>
    </header>
  );
}
