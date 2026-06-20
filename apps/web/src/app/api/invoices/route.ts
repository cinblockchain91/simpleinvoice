import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ListInvoicesQuerySchema,
  CreateInvoiceRequestSchema,
} from "@simpleinvoice/api-contracts";
import { InvoiceFetchError, InvoiceCreateError } from "@simpleinvoice/domain";
import { InvoiceAdapter } from "@/infrastructure/101digital/InvoiceAdapter";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";

const cookieStore = new SessionCookieStore();

export async function GET(request: NextRequest) {
  const session = await cookieStore.get();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const parsed = ListInvoicesQuerySchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    keyword: searchParams.get("keyword") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const adapter = new InvoiceAdapter(session.accessToken, session.orgToken);
  const result = await adapter.list(parsed.data);

  if (!result.ok) {
    if (result.error instanceof InvoiceFetchError) {
      return NextResponse.json(
        { error: "Failed to fetch invoices" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Invoice service unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json(result.value);
}

export async function POST(request: NextRequest) {
  const session = await cookieStore.get();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateInvoiceRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const adapter = new InvoiceAdapter(session.accessToken, session.orgToken);
  const result = await adapter.create(parsed.data);

  if (!result.ok) {
    if (result.error instanceof InvoiceCreateError) {
      return NextResponse.json(
        { error: "Failed to create invoice" },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: "Invoice service unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json(result.value, { status: 201 });
}
