import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect } from "vitest";
import { LoginForm } from "./LoginForm";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function setup(props: Partial<React.ComponentProps<typeof LoginForm>> = {}) {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<LoginForm onSubmit={onSubmit} {...props} />);
  return { onSubmit, user };
}

describe("LoginForm", () => {
  it("renders username and password fields with labels", () => {
    setup();
    expect(screen.getByLabelText("username")).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();
  });

  it("renders submit button with login text", () => {
    setup();
    expect(screen.getByRole("button", { name: "login" })).toBeInTheDocument();
  });

  it("shows validation errors when submitted empty", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
  });

  it("does not call onSubmit when form is invalid", async () => {
    const { onSubmit, user } = setup();
    await user.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() =>
      expect(screen.getByText("Username is required")).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with credentials when form is valid", async () => {
    const { onSubmit, user } = setup();
    await user.type(screen.getByLabelText("username"), "admin@example.com");
    await user.type(screen.getByLabelText("password"), "secret123");
    await user.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toEqual({
      username: "admin@example.com",
      password: "secret123",
    });
  });

  it("displays the error prop as text", () => {
    setup({ error: "Invalid username or password" });
    expect(
      screen.getByText("Invalid username or password"),
    ).toBeInTheDocument();
  });

  it("disables inputs and button when isLoading=true", () => {
    setup({ isLoading: true });
    expect(screen.getByLabelText("username")).toBeDisabled();
    expect(screen.getByLabelText("password")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows loading text on the button when isLoading=true", () => {
    setup({ isLoading: true });
    expect(
      screen.getByRole("button", { name: "loginLoading" }),
    ).toBeInTheDocument();
  });
});
