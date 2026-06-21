"use client";

import { FileText, PlusCircle, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useLogout } from "@/features/auth";

const navItems = [
  {
    href: "/invoices" as const,
    icon: FileText,
    labelKey: "invoices.title",
    exact: true,
  },
  {
    href: "/invoices/new" as const,
    icon: PlusCircle,
    labelKey: "invoices.createInvoice",
    exact: true,
  },
];

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { logout } = useLogout();

  return (
    <aside className="flex w-[200px] shrink-0 flex-col border-r bg-sidebar h-svh sticky top-0">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/invoices" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="text-sm font-semibold">SimpleInvoice</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-1 px-2 text-xs font-medium text-sidebar-foreground/60">
          {t("nav.platform")}
        </p>
        {navItems.map(({ href, icon: Icon, labelKey, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4 shrink-0" />
          <span>{t("auth.logout")}</span>
        </button>
      </div>
    </aside>
  );
}
