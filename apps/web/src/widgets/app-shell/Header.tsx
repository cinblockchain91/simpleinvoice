import { ThemeToggle, LanguageSwitcher } from "@/shared/ui";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-4">
        <span className="text-sm font-semibold tracking-tight">
          SimpleInvoice
        </span>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
