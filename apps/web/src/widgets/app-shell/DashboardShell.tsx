"use client";

import { useState, useEffect } from "react";
import { AppSidebar, SidebarContent } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";
import { Sheet, SheetContent, SheetTitle } from "@/shadcn/ui/sheet";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches) setMobileOpen(false);
    };
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="flex min-h-svh">
      {!isMobile && <AppSidebar collapsed={desktopCollapsed} />}

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-[200px] p-0 bg-sidebar [&>button:last-child]:hidden"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          isMobile={isMobile}
          collapsed={isMobile ? false : desktopCollapsed}
          onToggle={
            isMobile
              ? () => setMobileOpen((o) => !o)
              : () => setDesktopCollapsed((c) => !c)
          }
        />
        <div className="flex flex-1 flex-col pt-14">{children}</div>
      </main>
    </div>
  );
}
