import { NextResponse } from "next/server";
import { InvoiceFetchError, InvoiceNotFoundError } from "@simpleinvoice/domain";
import { InvoiceAdapter } from "@/infrastructure/101digital/InvoiceAdapter";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";

const cookieStore = new SessionCookieStore();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await cookieStore.get();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const adapter = new InvoiceAdapter(session.accessToken, session.orgToken);
  const result = await adapter.getById(id);

  if (!result.ok) {
    if (result.error instanceof InvoiceNotFoundError) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (result.error instanceof InvoiceFetchError) {
      if (result.error.upstreamStatus === 401) {
        await cookieStore.clear();
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(
        { error: "Failed to fetch invoice" },
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
