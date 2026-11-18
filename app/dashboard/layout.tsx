import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { DashSidebar, DashMobileNav } from "@/components/dash-sidebar";
import { DashHeader } from "@/components/dash-header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "customer") {
    redirect(user.role === "admin" ? "/admin" : "/provider/dashboard");
  }
  return (
    <div className="flex min-h-screen">
      <DashSidebar role="customer" userName={user.name} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashHeader userName={user.name} role="customer" />
        <DashMobileNav role="customer" />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
