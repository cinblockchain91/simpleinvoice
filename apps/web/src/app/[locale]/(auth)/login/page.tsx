"use client";

import { useLogin } from "@/features/auth";
import { LoginForm } from "@/features/auth";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const t = useTranslations("common");
  const { login, isLoading, error } = useLogin();

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("appName")}
          </h1>
        </div>
        <LoginForm onSubmit={login} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}
