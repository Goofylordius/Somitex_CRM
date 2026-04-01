import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) {
    redirect(new URL("/index.html", `${protocol}://${host}`));
  }

  redirect("/login");
}
