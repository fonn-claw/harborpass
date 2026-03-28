import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { TopBar } from "@/components/layout/top-bar";

export default async function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId || session.role !== "staff") {
    redirect("/login");
  }

  return (
    <>
      <TopBar userName={session.name} />
      <main className="bg-sand min-h-screen">{children}</main>
    </>
  );
}
