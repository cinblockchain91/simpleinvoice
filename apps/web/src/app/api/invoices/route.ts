import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unstable_cache, revalidateTag } from "next/cache";
import {
  ListInvoicesQuerySchema,
  CreateInvoiceRequestSchema,
} from "@simpleinvoice/api-contracts";
import { InvoiceFetchError, InvoiceCreateError } from "@simpleinvoice/domain";
import { InvoiceAdapter } from "@/infrastructure/101digital/InvoiceAdapter";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";

const cookieStore = new SessionCookieStore();

// Short numeric hash used solely as a per-user cache key discriminator (not for security)
function userKey(token: string): string {
  let h = 5381;
  const len = Math.min(token.length, 80);
  for (let i = 0; i < len; i++) {
    h = (Math.imul(h, 33) ^ token.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
}

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

  const uk = userKey(session.accessToken);
  const { page, pageSize, status, keyword } = parsed.data;
  const listTag = `invoices:${uk}`;

  const fetchInvoices = unstable_cache(
    async () => {
      const adapter = new InvoiceAdapter(session.accessToken, session.orgToken);
      return adapter.list(parsed.data);
    },
    [
      "invoices",
      uk,
      `p:${page}`,
      `ps:${pageSize}`,
      `st:${status ?? "ALL"}`,
      `kw:${keyword ?? ""}`,
    ],
    { revalidate: 30, tags: [listTag] },
  );

  const result = await fetchInvoices();

  if (!result.ok) {
    if (result.error instanceof InvoiceFetchError) {
      if (result.error.upstreamStatus === 401) {
        await cookieStore.clear();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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
      if (result.error.upstreamStatus === 401) {
        await cookieStore.clear();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
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

  // Bust the list cache for this user so the next GET returns fresh data
  revalidateTag(`invoices:${userKey(session.accessToken)}`, {});

  return NextResponse.json(result.value, { status: 201 });
}
