"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  LoginRequestSchema,
  type LoginRequest,
} from "@simpleinvoice/api-contracts";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shadcn/ui/form";
import { Input } from "@/shadcn/ui/input";
import { Button } from "@/shadcn/ui/button";

interface LoginFormProps {
  onSubmit: (data: LoginRequest) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  error,
}: LoginFormProps) {
  const t = useTranslations("auth");

  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("username")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("usernamePlaceholder")}
                  autoComplete="username"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="current-password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? t("loginLoading") : t("login")}
        </Button>
      </form>
    </Form>
  );
}
