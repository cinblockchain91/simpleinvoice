"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/shadcn/lib/utils";
import { Button } from "@/shadcn/ui/button";
import { Calendar } from "@/shadcn/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";

interface DatePickerProps {
  id?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: string; // YYYY-MM-DD — dates before this are disabled
  className?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selected = React.useMemo(() => {
    if (!value) return undefined;
    const d = parse(value, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : undefined;
  }, [value]);

  const disabledDays = React.useMemo(() => {
    if (!minDate) return undefined;
    const min = parse(minDate, "yyyy-MM-dd", new Date());
    return isValid(min) ? { before: min } : undefined;
  }, [minDate]);

  function handleSelect(day: Date | undefined) {
    onChange?.(day ? format(day, "yyyy-MM-dd") : "");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-between text-left font-normal",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" />
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          disabled={disabledDays}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
