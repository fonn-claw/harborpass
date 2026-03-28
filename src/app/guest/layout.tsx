import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { UserMenu } from "@/components/layout/user-menu";

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
      <header className="bg-white border-b border-fog h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img
            src="/assets/logo.svg"
            alt="HarborPass"
            width={120}
            height={30}
          />
          <span className="font-heading text-navy text-base font-semibold">
            Guest Portal
          </span>
        </div>
        <div className="flex items-center">
          <UserMenu userName={session.name} variant="light" />
        </div>
      </header>
      <main className="bg-sand min-h-screen">{children}</main>
    </>
  );
}
