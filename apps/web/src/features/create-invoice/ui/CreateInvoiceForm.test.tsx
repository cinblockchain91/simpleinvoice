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
    expect(screen.getByLabelText("fields.invoiceNumber")).toBeInTheDocument();
    expect(screen.getByLabelText("fields.currency")).toBeInTheDocument();
    expect(screen.getByLabelText("fields.issueDate")).toBeInTheDocument();
    expect(screen.getByLabelText("fields.dueDate")).toBeInTheDocument();
    expect(screen.getByLabelText("fields.customerName")).toBeInTheDocument();
    expect(screen.getByLabelText("fields.customerId")).toBeInTheDocument();
  });

  it("starts with one line item row", () => {
    setup();
    const removeButtons = screen.getAllByRole("button", {
      name: "lineItems.removeItem",
    });
    expect(removeButtons).toHaveLength(1);
  });

  it("remove button is disabled when only one line item", () => {
    setup();
    const removeBtn = screen.getByRole("button", {
      name: "lineItems.removeItem",
    });
    expect(removeBtn).toBeDisabled();
  });

  it("adds a new line item row when Add Item is clicked", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "lineItems.addItem" }));
    const removeButtons = screen.getAllByRole("button", {
      name: "lineItems.removeItem",
    });
    expect(removeButtons).toHaveLength(2);
  });

  it("enables the remove button when multiple line items exist", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "lineItems.addItem" }));
    const removeButtons = screen.getAllByRole("button", {
      name: "lineItems.removeItem",
    });
    removeButtons.forEach((btn) => expect(btn).not.toBeDisabled());
  });

  it("removes a line item row when remove is clicked", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "lineItems.addItem" }));
    expect(
      screen.getAllByRole("button", { name: "lineItems.removeItem" }),
    ).toHaveLength(2);
    await user.click(
      screen.getAllByRole("button", { name: "lineItems.removeItem" })[0],
    );
    expect(
      screen.getAllByRole("button", { name: "lineItems.removeItem" }),
    ).toHaveLength(1);
  });

  it("shows validation errors when form is submitted empty", async () => {
    const { user } = setup();
    // Clear the default currency value so currency validation also fires
    await user.clear(screen.getByLabelText("fields.currency"));
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
    expect(screen.getByLabelText("fields.invoiceNumber")).toBeDisabled();
    expect(screen.getByLabelText("fields.currency")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "submitLoading" }),
    ).toBeDisabled();
  });
});
