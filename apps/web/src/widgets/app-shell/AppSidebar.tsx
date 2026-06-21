"use client";

import { FileText, PlusCircle, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/shadcn/lib/utils";
import { useLogout } from "@/shared/hooks/useLogout";

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

interface SidebarContentProps {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarContent({
  collapsed = false,
  onNavigate,
}: SidebarContentProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { logout } = useLogout();

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-3">
        <Link
          href="/invoices"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center",
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <FileText className="size-4" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold">SimpleInvoice</span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {!collapsed && (
          <p className="mb-1 px-2 text-xs font-medium text-sidebar-foreground/60">
            {t("nav.platform")}
          </p>
        )}
        {navItems.map(({ href, icon: Icon, labelKey, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? t(labelKey) : undefined}
              className={cn(
                "flex items-center rounded-md py-1.5 text-sm transition-colors",
                collapsed ? "justify-center px-1.5" : "gap-2 px-2",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{t(labelKey)}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <button
          onClick={() => {
            logout();
            onNavigate?.();
          }}
          title={collapsed ? t("auth.logout") : undefined}
          className={cn(
            "flex w-full items-center rounded-md py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed ? "justify-center px-1.5" : "gap-2 px-2",
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>{t("auth.logout")}</span>}
        </button>
      </div>
    </>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r bg-sidebar h-svh sticky top-0 overflow-hidden transition-[width] duration-200 ease-linear",
        collapsed ? "w-12" : "w-[200px]",
      )}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}
