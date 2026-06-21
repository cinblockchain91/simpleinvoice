"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/shadcn/ui/input";
import { SearchIcon, XIcon } from "lucide-react";
import { Button } from "@/shadcn/ui/button";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const t = useTranslations("invoices");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex items-center">
      <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("filters.searchPlaceholder")}
        className="pl-9 pr-8 w-72"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label={t("filters.clearSearch")}
        >
          <XIcon className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
