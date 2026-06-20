import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LoginRequestSchema } from "@simpleinvoice/api-contracts";
import { InvalidCredentialsError } from "@simpleinvoice/domain";
import { AuthAdapter } from "@/infrastructure/101digital/AuthAdapter";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";

const authAdapter = new AuthAdapter();
const cookieStore = new SessionCookieStore();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LoginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const result = await authAdapter.login(parsed.data);

  if (!result.ok) {
    if (result.error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 503 },
    );
  }

  await cookieStore.set(result.value);

  return NextResponse.json({ success: true });
}
