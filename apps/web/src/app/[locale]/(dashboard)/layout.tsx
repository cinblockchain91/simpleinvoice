import { SidebarProvider } from "@/shadcn/ui/sidebar";
import { AppSidebar, DashboardHeader } from "@/widgets/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-1 min-w-0 flex-col">
        <DashboardHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </main>
    </SidebarProvider>
  );
}
