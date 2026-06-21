"use client";

import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { DashboardHeader } from "./DashboardHeader";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-svh">
      <AppSidebar collapsed={collapsed} />
      <main className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}
