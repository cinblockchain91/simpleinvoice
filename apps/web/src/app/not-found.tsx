import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function NotFound() {
  const cookieStore = await cookies();
  const hasToken = cookieStore.has("access_token");

  if (hasToken) {
    redirect("/invoices");
  } else {
    redirect("/login");
  }
}
