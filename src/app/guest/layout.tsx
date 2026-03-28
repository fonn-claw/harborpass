import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { GuestHeader } from "@/components/layout/guest-header";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId || session.role !== "guest") {
    redirect("/login");
  }

  return (
    <>
      <GuestHeader userName={session.name} />
      <main className="bg-sand min-h-screen">{children}</main>
    </>
  );
}
