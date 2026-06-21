import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { unstable_cache } from "next/cache";
import { InvoiceAdapter } from "@/infrastructure/101digital/InvoiceAdapter";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";
import { InvoiceNotFoundError } from "@simpleinvoice/domain";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await cookieStore.get();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const uk = userKey(session.accessToken);

  const fetchInvoice = unstable_cache(
    async () => {
      const adapter = new InvoiceAdapter(session.accessToken, session.orgToken);
      return adapter.getById(id);
    },
    ["invoice", id, uk],
    { revalidate: 60, tags: [`invoice:${id}:${uk}`] },
  );

  const result = await fetchInvoice();

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
