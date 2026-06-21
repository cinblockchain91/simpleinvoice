"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");

    const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
      setCollapsed(e.matches);
    };

    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="flex min-h-svh">
      <AppSidebar collapsed={collapsed} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
        <div className="flex flex-1 flex-col pt-14">{children}</div>
      </main>
    </div>
  );
}
