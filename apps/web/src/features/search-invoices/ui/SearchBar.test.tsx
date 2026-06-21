import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./SearchBar";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("SearchBar", () => {
  it("renders a text input", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays the current value in the input", () => {
    render(<SearchBar value="Acme Corp" onChange={vi.fn()} />);
    expect(screen.getByRole("textbox")).toHaveValue("Acme Corp");
  });

  it("renders the placeholder from translations", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(
      screen.getByPlaceholderText("filters.searchPlaceholder"),
    ).toBeInTheDocument();
  });

  it("calls onChange with the typed value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="" onChange={onChange} />);
    await user.type(screen.getByRole("textbox"), "Corp");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls.at(-1)?.[0]).toBe("p");
  });

  it("does not show clear button when value is empty", () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(
      screen.queryByRole("button", { name: "filters.clearSearch" }),
    ).not.toBeInTheDocument();
  });

  it("shows clear button when value is non-empty", () => {
    render(<SearchBar value="Acme" onChange={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "filters.clearSearch" }),
    ).toBeInTheDocument();
  });

  it("calls onChange with empty string when clear button is clicked", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar value="Acme" onChange={onChange} />);
    await user.click(
      screen.getByRole("button", { name: "filters.clearSearch" }),
    );
    expect(onChange).toHaveBeenCalledWith("");
  });
});
