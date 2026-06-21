"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BffError } from "@/shared/api/bff-client";

function handleBffError(error: unknown) {
  if (error instanceof BffError && error.status === 401) {
    // Tokens cleared by the route handler — redirect to login so the user
    // can re-authenticate. Use replace so the expired page isn't in history.
    window.location.replace("/login");
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleBffError }),
    mutationCache: new MutationCache({ onError: handleBffError }),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        retry: (failureCount, error) => {
          if (error instanceof BffError && error.status === 401) return false;
          return failureCount < 1;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
