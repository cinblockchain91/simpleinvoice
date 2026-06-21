import { AppSidebar, DashboardHeader } from "@/widgets/app-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh">
      <AppSidebar />
      <main className="flex w-[calc(100%-200px)] flex-col">
        <DashboardHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </main>
    </div>
  );
}
