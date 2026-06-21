import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function setup(
  props: Partial<React.ComponentProps<typeof CreateInvoiceForm>> = {},
) {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<CreateInvoiceForm onSubmit={onSubmit} {...props} />);
  return { onSubmit, user };
}

describe("CreateInvoiceForm", () => {
  it("renders all invoice header fields", () => {
    setup();
    expect(
      screen.getByLabelText("fields.invoiceNumber", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("fields.currency", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("fields.issueDate", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("fields.dueDate", { exact: false }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("fields.customerName", { exact: false }),
    ).toBeInTheDocument();
  });

  it("renders one static line item with all required fields", () => {
    setup();
    expect(
      screen.getByPlaceholderText("lineItems.description"),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(3); // quantity, unitPrice, taxRate
  });

  it("does not show Add Item or Remove Item buttons", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: "lineItems.addItem" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "lineItems.removeItem" }),
    ).not.toBeInTheDocument();
  });

  it("shows validation errors when form is submitted empty", async () => {
    const { user } = setup();
    await user.clear(
      screen.getByLabelText("fields.currency", { exact: false }),
    );
    await user.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() => {
      expect(
        screen.getByText("Invoice number is required"),
      ).toBeInTheDocument();
    });
  });

  it("does not call onSubmit when form is invalid", async () => {
    const { onSubmit, user } = setup();
    await user.click(screen.getByRole("button", { name: "submit" }));
    await waitFor(() =>
      expect(
        screen.getByText("Invoice number is required"),
      ).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("displays the error prop as text", () => {
    setup({ error: "Failed to create invoice." });
    expect(screen.getByText("Failed to create invoice.")).toBeInTheDocument();
  });

  it("disables inputs and buttons when isLoading=true", () => {
    setup({ isLoading: true });
    expect(
      screen.getByLabelText("fields.invoiceNumber", { exact: false }),
    ).toBeDisabled();
    expect(
      screen.getByLabelText("fields.currency", { exact: false }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "submitLoading" }),
    ).toBeDisabled();
  });
});
