import { http, HttpResponse } from "msw";

const BASE_URL = "https://sandbox.101digital.io";

// ---------------------------------------------------------------------------
// Auth handlers
// ---------------------------------------------------------------------------

export const authHandlers = [
  // POST /oauth2/token — returns access_token
  http.post(`${BASE_URL}/oauth2/token`, () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      token_type: "Bearer",
      expires_in: 3600,
    });
  }),

  // GET /membership-service — returns org token inside memberships[0].token
  http.get(`${BASE_URL}/membership-service/2.0.0/memberships`, () => {
    return HttpResponse.json({
      data: [
        {
          token: "mock-org-token",
          organisationId: "mock-org-id",
          userId: "mock-user-id",
        },
      ],
      paging: { pageSize: 10, pageNum: 1, total: 1 },
    });
  }),
];

// ---------------------------------------------------------------------------
// Invoice handlers
// ---------------------------------------------------------------------------

const MOCK_INVOICE = {
  id: "inv-001",
  invoiceNumber: "INV-2024-001",
  status: "PENDING",
  currency: "USD",
  totalAmount: 1155,
  subTotal: 1050,
  taxAmount: 105,
  issueDate: "2024-01-15",
  dueDate: "2024-02-15",
  customerId: "cust-001",
  customerName: "Acme Corp",
  items: [
    {
      id: "item-001",
      description: "Consulting services",
      quantity: 10,
      unitPrice: 105,
      amount: 1050,
      taxRate: 10,
      taxAmount: 105,
    },
  ],
  createdDate: "2024-01-15T00:00:00.000Z",
  modifiedDate: "2024-01-15T00:00:00.000Z",
};

export const invoiceHandlers = [
  // GET /invoice-service — list invoices (paginated)
  http.get(`${BASE_URL}/invoice-service/2.0.0/invoices`, () => {
    return HttpResponse.json({
      data: [MOCK_INVOICE],
      paging: { pageSize: 10, pageNum: 1, total: 1 },
    });
  }),

  // POST /invoice-service — create invoice
  http.post(`${BASE_URL}/invoice-service/2.0.0/invoices`, () => {
    return HttpResponse.json({
      data: { ...MOCK_INVOICE, id: "inv-new", invoiceNumber: "INV-2024-002" },
    });
  }),
];

// ---------------------------------------------------------------------------
// All handlers combined (default export)
// ---------------------------------------------------------------------------

export const handlers = [...authHandlers, ...invoiceHandlers];
