"use client";

import { useState, useCallback, useTransition } from "react";

interface UseInvoiceSearchReturn {
  keyword: string;
  debouncedKeyword: string;
  setKeyword: (value: string) => void;
  isPending: boolean;
}

export function useInvoiceSearch(debounceMs = 400): UseInvoiceSearchReturn {
  const [keyword, setKeywordRaw] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isPending, startTransition] = useTransition();
  const timerRef = { current: 0 as ReturnType<typeof setTimeout> };

  const setKeyword = useCallback(
    (value: string) => {
      setKeywordRaw(value);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        startTransition(() => {
          setDebouncedKeyword(value);
        });
      }, debounceMs);
    },
    [debounceMs],
  );

  return { keyword, debouncedKeyword, setKeyword, isPending };
}
