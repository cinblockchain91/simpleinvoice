"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { LoginRequest } from "@simpleinvoice/api-contracts";
import { useAuthStore } from "@/shared/store";
import { useRouter } from "@/i18n/navigation";

export function useLogin() {
  const t = useTranslations("auth");
  const router = useRouter();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: LoginRequest) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        setError(t("loginError"));
        return;
      }

      if (!res.ok) {
        setError(t("loginError"));
        return;
      }

      setAuthenticated(data.username);
      router.push("/invoices");
    } catch {
      setError(t("loginError"));
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
