import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui";
import { Logo } from "@/components/logo";
import { RegisterForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getSessionUser();
  if (user) {
    redirect(user.role === "admin" ? "/admin" : user.role === "provider" ? "/provider/dashboard" : "/dashboard");
  }
  const { role } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16">
        <Card className="p-8">
          <div className="mb-6 flex flex-col items-center">
            <Logo />
            <h1 className="mt-4 text-xl font-bold text-navy">Join FIXORA</h1>
            <p className="mt-1 text-center text-sm text-ink-soft">
              Book trusted pros, or grow your service business.
            </p>
          </div>
          <RegisterForm defaultRole={role === "provider" ? "provider" : "customer"} />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
