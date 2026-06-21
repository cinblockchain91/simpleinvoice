"use client";

import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/shared/store";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    clearAuth();
    router.replace("/login");
  }

  return { logout };
}
