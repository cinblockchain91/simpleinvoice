"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CreateInvoiceRequestSchema,
  type CreateInvoiceRequest,
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
import { Separator } from "@/shadcn/ui/separator";
import { DatePicker } from "@/shared/ui/DatePicker";

interface CreateInvoiceFormProps {
  onSubmit: (data: CreateInvoiceRequest) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export function CreateInvoiceForm({
  onSubmit,
  isLoading = false,
  error,
}: CreateInvoiceFormProps) {
  const t = useTranslations("createInvoice");

  const form = useForm<CreateInvoiceRequest>({
    resolver: zodResolver(CreateInvoiceRequestSchema),
    defaultValues: {
      invoiceNumber: "",
      currency: "USD",
      issueDate: "",
      dueDate: "",
      customerName: "",
      customerEmail: "",
      items: [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }],
    },
  });

  const issueDate = useWatch({ control: form.control, name: "issueDate" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Invoice details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="invoiceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  {t("fields.invoiceNumber")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="INV-001"
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
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  {t("fields.currency")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="USD"
                    maxLength={3}
                    disabled={isLoading}
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.toUpperCase())
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  {t("fields.issueDate")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("fields.issueDatePlaceholder")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  {t("fields.dueDate")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("fields.dueDatePlaceholder")}
                    disabled={isLoading}
                    minDate={issueDate || undefined}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  {t("fields.customerName")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Corp"
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
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-foreground">
                  {t("fields.customerEmail")}{" "}
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Single line item */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t("lineItems.title")}</h3>

          <div className="hidden grid-cols-[1fr_80px_100px_80px] gap-2 text-xs font-medium text-muted-foreground sm:grid">
            <span>{t("lineItems.description")}</span>
            <span>{t("lineItems.quantity")}</span>
            <span>{t("lineItems.unitPrice")}</span>
            <span>{t("lineItems.taxRate")}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_100px_80px] sm:items-start border rounded-md p-3">
            <FormField
              control={form.control}
              name="items.0.description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder={t("lineItems.description")}
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
              name="items.0.quantity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? 0
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items.0.unitPrice"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? 0
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="items.0.taxRate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          Number.isNaN(e.target.valueAsNumber)
                            ? 0
                            : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t("submitLoading") : t("submit")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
