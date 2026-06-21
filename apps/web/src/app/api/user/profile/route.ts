import { NextResponse } from "next/server";
import { SessionCookieStore } from "@/infrastructure/storage/SessionCookieStore";
import { env } from "@/shared/config/env.server";
import type { UserProfile } from "@simpleinvoice/api-contracts";

const cookieStore = new SessionCookieStore();

export async function GET() {
  const session = await cookieStore.get();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let profile: UserProfile;
  try {
    const res = await fetch(
      `${env.DIGITAL_API_BASE_URL}/membership-service/1.0.0/users/me`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    if (res.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch user profile" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const user = data?.data?.[0] ?? data;

    profile = {
      userId: user.userId ?? user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName ?? user.name ?? user.username,
      organizationId: user.organizationId ?? "",
    };
  } catch {
    return NextResponse.json(
      { error: "Profile service unavailable" },
      { status: 503 },
    );
  }

  return NextResponse.json(profile);
}
