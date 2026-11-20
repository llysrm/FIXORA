import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const lang = await getLang();
  const t = getDict(lang);
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-navy">{t.contact_title}</h1>
        <p className="mt-2 text-ink-soft">{t.contact_subtitle}</p>
        <Card className="mt-8 p-6 sm:p-8">
          <ContactForm />
        </Card>
      </main>
      <Footer />
    </div>
  );
}
