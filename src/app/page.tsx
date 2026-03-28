import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (!session.userId) redirect("/login");
  const routes: Record<string, string> = {
    staff: "/board",
    manager: "/manager",
    guest: "/guest",
  };
  redirect(routes[session.role] || "/login");
}
