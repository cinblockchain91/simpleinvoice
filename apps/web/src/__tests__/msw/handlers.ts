import { http, HttpResponse } from "msw";

// Must match vitest.integration.config.ts env vars
export const AUTH_BASE = "https://auth.101digital.test";
export const API_BASE = "https://api.101digital.test";

// Shape matches ApiInvoiceSchema in InvoiceAdapter.ts
export const MOCK_API_INVOICE = {
  invoiceId: "inv-001",
  invoiceNumber: "INV-2024-001",
  currency: "USD",
  invoiceDate: "2024-01-15",
  dueDate: "2024-02-15",
  invoiceSubTotal: 1000,
  totalTax: 100,
  totalAmount: 1100,
  status: [
    { key: "Draft", value: true },
    { key: "Due", value: false },
  ],
  customer: { id: "cust-001", name: "Acme Corp" },
  createdAt: "2024-01-15T00:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Auth handlers — paths match AuthAdapter.ts fetch calls
// ---------------------------------------------------------------------------

export const authHandlers = [
  // POST /t/101digital.core/oauth2/token — OAuth2 password grant
  http.post(`${AUTH_BASE}/t/101digital.core/oauth2/token`, () =>
    HttpResponse.json({
      access_token: "mock-access-token",
      token_type: "Bearer",
      expires_in: 3600,
    }),
  ),

  // GET /membership-service/1.0.0/users/me — fetch org token
  http.get(`${API_BASE}/membership-service/1.0.0/users/me`, () =>
    HttpResponse.json({
      data: {
        memberships: [
          { token: "mock-org-token", organisationId: "mock-org-id" },
        ],
      },
    }),
  ),
];

// ---------------------------------------------------------------------------
// Invoice handlers — paths match InvoiceAdapter.ts fetch calls
// ---------------------------------------------------------------------------

export const invoiceHandlers = [
  // GET /invoice-service/1.0.0/invoices — list (paginated)
  http.get(`${API_BASE}/invoice-service/1.0.0/invoices`, () =>
    HttpResponse.json({ data: [MOCK_API_INVOICE], total: 1 }),
  ),

  // GET /invoice-service/1.0.0/invoices/:id — single invoice
  http.get(`${API_BASE}/invoice-service/1.0.0/invoices/:id`, ({ params }) => {
    if (params.id === MOCK_API_INVOICE.invoiceId) {
      return HttpResponse.json({ data: MOCK_API_INVOICE });
    }
    return new HttpResponse(null, { status: 404 });
  }),

  // POST /invoice-service/1.0.0/invoices — create invoice
  http.post(`${API_BASE}/invoice-service/1.0.0/invoices`, () =>
    HttpResponse.json({
      data: {
        ...MOCK_API_INVOICE,
        invoiceId: "inv-new",
        invoiceNumber: "INV-2024-002",
      },
    }),
  ),
];

export const handlers = [...authHandlers, ...invoiceHandlers];
