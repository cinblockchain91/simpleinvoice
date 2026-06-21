"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/shared/ui";
import { Button } from "@/shadcn/ui/button";
import { useLogout } from "@/features/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("auth");
  const { logout } = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <span className="text-sm font-semibold tracking-tight">
          SimpleInvoice
        </span>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
