"use client";

import { useAuthStore } from "@/shared/store";
import { useRouter } from "@/i18n/navigation";

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
