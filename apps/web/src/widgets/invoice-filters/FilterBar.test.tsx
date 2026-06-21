import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// ── Mock Radix Select — too complex for jsdom without a full browser ───────────
vi.mock("@/shadcn/ui/select", () => ({
  Select: ({
    value,
    onValueChange,
    children,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      data-testid="status-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    value,
    children,
  }: {
    value: string;
    children: React.ReactNode;
  }) => <option value={value}>{children}</option>,
}));

import { FilterBar } from "./FilterBar";

describe("FilterBar", () => {
  it("renders the status select", () => {
    render(<FilterBar status="ALL" onStatusChange={vi.fn()} />);
    expect(screen.getByTestId("status-select")).toBeInTheDocument();
  });

  it("shows all status options", () => {
    render(<FilterBar status="ALL" onStatusChange={vi.fn()} />);
    expect(screen.getByText("filters.allStatuses")).toBeInTheDocument();
    expect(screen.getByText("status.PENDING")).toBeInTheDocument();
    expect(screen.getByText("status.APPROVED")).toBeInTheDocument();
    expect(screen.getByText("status.REJECTED")).toBeInTheDocument();
    expect(screen.getByText("status.VOID")).toBeInTheDocument();
  });

  it("reflects the current status value as the selected option", () => {
    render(<FilterBar status="PENDING" onStatusChange={vi.fn()} />);
    expect(screen.getByTestId("status-select")).toHaveValue("PENDING");
  });

  it("calls onStatusChange when a different status is selected", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<FilterBar status="ALL" onStatusChange={onStatusChange} />);
    await user.selectOptions(screen.getByTestId("status-select"), "APPROVED");
    expect(onStatusChange).toHaveBeenCalledWith("APPROVED");
  });

  it("calls onStatusChange with ALL when the all-statuses option is selected", async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<FilterBar status="PENDING" onStatusChange={onStatusChange} />);
    await user.selectOptions(screen.getByTestId("status-select"), "ALL");
    expect(onStatusChange).toHaveBeenCalledWith("ALL");
  });
});
