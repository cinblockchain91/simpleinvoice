"use client";

import { useState, useCallback } from "react";

interface UseInvoicePaginationReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  goToFirst: () => void;
  goToLast: (total: number) => void;
  totalPages: (total: number) => number;
}

export function useInvoicePagination(
  initialPage = 1,
  initialPageSize = 10,
): UseInvoicePaginationReturn {
  const [page, setPageRaw] = useState(initialPage);
  const [pageSize, setPageSizeRaw] = useState(initialPageSize);

  const setPage = useCallback((p: number) => setPageRaw(p), []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeRaw(size);
    setPageRaw(1);
  }, []);

  const goToFirst = useCallback(() => setPageRaw(1), []);

  const goToLast = useCallback(
    (total: number) => {
      const last = Math.ceil(total / pageSize);
      setPageRaw(last > 0 ? last : 1);
    },
    [pageSize],
  );

  const totalPages = useCallback(
    (total: number) => Math.ceil(total / pageSize) || 1,
    [pageSize],
  );

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    goToFirst,
    goToLast,
    totalPages,
  };
}
