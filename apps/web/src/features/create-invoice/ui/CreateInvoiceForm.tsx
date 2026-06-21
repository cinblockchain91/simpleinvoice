"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { PlusIcon, Trash2Icon } from "lucide-react";
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

interface CreateInvoiceFormProps {
  onSubmit: (data: CreateInvoiceRequest) => void | Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const DEFAULT_ITEM = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
};

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
      customerId: "",
      customerName: "",
      items: [DEFAULT_ITEM],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

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
                <FormLabel>{t("fields.invoiceNumber")}</FormLabel>
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
                <FormLabel>{t("fields.currency")}</FormLabel>
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
                <FormLabel>{t("fields.issueDate")}</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isLoading} {...field} />
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
                <FormLabel>{t("fields.dueDate")}</FormLabel>
                <FormControl>
                  <Input type="date" disabled={isLoading} {...field} />
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
                <FormLabel>{t("fields.customerName")}</FormLabel>
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
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fields.customerId")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="customer-uuid"
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

        {/* Line items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{t("lineItems.title")}</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(DEFAULT_ITEM)}
              disabled={isLoading}
            >
              <PlusIcon className="mr-1 h-3.5 w-3.5" />
              {t("lineItems.addItem")}
            </Button>
          </div>

          {/* Header row */}
          <div className="hidden grid-cols-[1fr_80px_100px_80px_36px] gap-2 text-xs font-medium text-muted-foreground sm:grid">
            <span>{t("lineItems.description")}</span>
            <span>{t("lineItems.quantity")}</span>
            <span>{t("lineItems.unitPrice")}</span>
            <span>{t("lineItems.taxRate")}</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px_100px_80px_36px] sm:items-start border rounded-md p-2"
            >
              <FormField
                control={form.control}
                name={`items.${index}.description`}
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
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.unitPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`items.${index}.taxRate`}
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
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive mt-0.5"
                onClick={() => remove(index)}
                disabled={isLoading || fields.length === 1}
                aria-label={t("lineItems.removeItem")}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
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
