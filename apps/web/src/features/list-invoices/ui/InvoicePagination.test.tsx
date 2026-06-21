import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InvoicePagination } from "./InvoicePagination";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("InvoicePagination", () => {
  it("returns null when totalPages is 1", () => {
    const { container } = render(
      <InvoicePagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("returns null when totalPages is 0", () => {
    const { container } = render(
      <InvoicePagination page={1} totalPages={0} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders all page numbers when totalPages <= 7", () => {
    render(
      <InvoicePagination page={1} totalPages={5} onPageChange={vi.fn()} />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("calls onPageChange with next page on Next click", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <InvoicePagination page={2} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole("link", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("calls onPageChange with previous page on Previous click", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <InvoicePagination page={3} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole("link", { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("does not call onPageChange when Previous is clicked on first page", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <InvoicePagination page={1} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole("link", { name: /previous/i }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("does not call onPageChange when Next is clicked on last page", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <InvoicePagination page={5} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole("link", { name: /next/i }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("calls onPageChange with the page number when a numbered link is clicked", async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(
      <InvoicePagination page={1} totalPages={5} onPageChange={onPageChange} />,
    );
    await user.click(screen.getByRole("link", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("shows ellipsis for large page ranges", () => {
    render(
      <InvoicePagination page={5} totalPages={10} onPageChange={vi.fn()} />,
    );
    // buildPageRange(5, 10) → [1, "…", 4, 5, 6, "…", 10]
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("marks the active page with aria-current", () => {
    render(
      <InvoicePagination page={3} totalPages={5} onPageChange={vi.fn()} />,
    );
    const activeLink = screen.getByRole("link", { name: "3" });
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });
});
