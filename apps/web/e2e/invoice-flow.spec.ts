import { test, expect, type Page, type BrowserContext } from "@playwright/test";

// ── Mock fixtures ─────────────────────────────────────────────────────────────

const MOCK_INVOICE = {
  id: "inv-001",
  invoiceNumber: "INV-001",
  status: "DRAFT",
  currency: "USD",
  totalAmount: 1100,
  subTotal: 1000,
  taxAmount: 100,
  issueDate: "2026-06-21",
  dueDate: "2026-07-21",
  customerId: "cust-123",
  customerName: "Acme Corp",
  items: [],
  createdDate: "2026-06-21T00:00:00Z",
  modifiedDate: "2026-06-21T00:00:00Z",
};

const MOCK_INVOICE_LIST = {
  data: [MOCK_INVOICE],
  total: 1,
  page: 1,
  pageSize: 10,
};

const MOCK_SESSION_COOKIES = [
  {
    name: "access_token",
    value: "e2e-mock-access-token",
    domain: "localhost",
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Strict" as const,
  },
  {
    name: "org_token",
    value: "e2e-mock-org-token",
    domain: "localhost",
    path: "/",
    httpOnly: true,
    secure: false,
    sameSite: "Strict" as const,
  },
];

// ── Route mock helpers ────────────────────────────────────────────────────────

async function mockInvoiceRoutes(page: Page) {
  await page.route("**/api/invoices", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(MOCK_INVOICE_LIST),
      });
    } else {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ...MOCK_INVOICE,
          id: "inv-new",
          invoiceNumber: "INV-002",
        }),
      });
    }
  });
}

async function setAuthCookies(context: BrowserContext) {
  await context.addCookies(MOCK_SESSION_COOKIES);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe("Login flow", () => {
  test("shows login form and redirects to invoices on success", async ({
    page,
    context,
  }) => {
    // Mock the login BFF endpoint; inject cookies so the middleware allows access
    await page.route("**/api/auth/login", async (route) => {
      await context.addCookies(MOCK_SESSION_COOKIES);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/en/login");

    // Form is visible
    await expect(page.getByLabel("Username")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // Fill and submit
    await page.getByLabel("Username").fill("testuser@example.com");
    await page.getByLabel("Password").fill("secret123");
    await page.getByRole("button", { name: "Log in" }).click();

    // Redirect to invoice list
    await expect(page).toHaveURL(/\/en\/invoices$/);
  });

  test("shows error message on invalid credentials", async ({ page }) => {
    await page.route("**/api/auth/login", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "Invalid username or password" }),
      }),
    );

    await page.goto("/en/login");
    await page.getByLabel("Username").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpass");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Invalid username or password")).toBeVisible();
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/en/invoices");
    await expect(page).toHaveURL(/\/en\/login/);
  });
});

test.describe("Invoice list", () => {
  test.beforeEach(async ({ page, context }) => {
    await setAuthCookies(context);
    await mockInvoiceRoutes(page);
  });

  test("renders the invoice list page with table", async ({ page }) => {
    await page.goto("/en/invoices");

    await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible();
    await expect(page.getByText("Invoice #")).toBeVisible();
    await expect(page.getByText("INV-001")).toBeVisible();
    await expect(page.getByText("Acme Corp")).toBeVisible();
  });

  test("renders Create Invoice button", async ({ page }) => {
    await page.goto("/en/invoices");
    await expect(
      page.getByRole("link", { name: /Create Invoice/i }),
    ).toBeVisible();
  });

  test("navigates to create invoice page on button click", async ({ page }) => {
    await page.goto("/en/invoices");
    await page.getByRole("link", { name: /Create Invoice/i }).click();
    await expect(page).toHaveURL(/\/en\/invoices\/new$/);
    await expect(
      page.getByRole("heading", { name: "Create Invoice" }),
    ).toBeVisible();
  });
});

test.describe("Create invoice", () => {
  test.beforeEach(async ({ page, context }) => {
    await setAuthCookies(context);
    await mockInvoiceRoutes(page);
  });

  test("full create invoice flow — fills form, submits, shows toast, redirects", async ({
    page,
  }) => {
    await page.goto("/en/invoices/new");

    // Fill invoice header fields
    await page.getByLabel("Invoice Number").fill("INV-E2E-001");
    await page.getByLabel("Currency").fill("USD");
    await page.getByLabel("Issue Date").fill("2026-06-21");
    await page.getByLabel("Due Date").fill("2026-07-21");
    await page.getByLabel("Customer Name").fill("E2E Test Corp");
    await page.getByLabel("Customer ID").fill("cust-e2e-001");

    // Fill the first line item
    const descriptionInputs = page.getByPlaceholder("Description");
    await descriptionInputs.first().fill("Consulting services");

    // Submit the form
    await page.getByRole("button", { name: "Create Invoice" }).click();

    // Success toast appears
    await expect(page.getByText("Invoice created successfully")).toBeVisible({
      timeout: 5000,
    });

    // Redirected back to invoice list
    await expect(page).toHaveURL(/\/en\/invoices$/);
  });

  test("shows validation error when required fields are empty", async ({
    page,
  }) => {
    await page.goto("/en/invoices/new");

    // Clear the pre-filled currency field and submit
    await page.getByLabel("Currency").clear();
    await page.getByRole("button", { name: "Create Invoice" }).click();

    await expect(page.getByText("Invoice number is required")).toBeVisible();
  });

  test("back button navigates to invoice list", async ({ page }) => {
    await page.goto("/en/invoices/new");
    await page.getByRole("link", { name: "" }).click(); // arrow back icon link

    await expect(page).toHaveURL(/\/en\/invoices$/);
  });
});
