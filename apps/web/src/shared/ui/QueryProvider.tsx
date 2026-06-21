"use client";

import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  QueryCache,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function is401(error: unknown): boolean {
  return (
    error != null &&
    typeof error === "object" &&
    "status" in error &&
    (error as { status: unknown }).status === 401
  );
}

function handleBffError(error: unknown) {
  if (is401(error)) {
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
          if (is401(error)) return false;
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
