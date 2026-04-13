import Sidebar from "@/components/sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.role !== "CLIENT") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="CLIENT" />
      <main className="flex-1 ml-64 p-8 bg-background">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
