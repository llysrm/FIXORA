import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy">Contact us</h1>
        <p className="mt-2 text-ink-soft">
          Question, complaint, or something went wrong with a booking? Send us a message and the
          team will follow up.
        </p>
        <Card className="mt-8 p-6 sm:p-8">
          <ContactForm />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
