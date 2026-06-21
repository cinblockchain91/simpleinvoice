import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { InvoiceAdapter } from "@/infrastructure/101digital/InvoiceAdapter";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";
import { InvoiceNotFoundError } from "@simpleinvoice/domain";

const cookieStore = new SessionCookieStore();

export async function GET(
  _request: NextRequest,
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
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 502 },
    );
  }

  return NextResponse.json(result.value);
}
