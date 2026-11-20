import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { APP_NAME } from "@/lib/constants";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";
import { LanguageSwitcher } from "./language-switcher";

export async function Footer() {
  const lang = await getLang();
  const t = getDict(lang);
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              {t.footer_tagline}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">{t.footer_platform}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li><Link href="/services" className="hover:text-navy">{t.footer_browse}</Link></li>
              <li><Link href="/register?role=provider" className="hover:text-navy">{t.footer_become_provider}</Link></li>
              <li><Link href="/about" className="hover:text-navy">{t.footer_about}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">{t.footer_support}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li><Link href="/contact" className="hover:text-navy">{t.footer_contact}</Link></li>
              <li><Link href="/contact" className="hover:text-navy">{t.footer_report}</Link></li>
              <li><Link href="/login" className="hover:text-navy">{t.footer_login}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">{t.footer_get_in_touch}</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@fixora.id</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +62 812 0000 2030</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Jakarta, Indonesia</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-soft">
            © {new Date().getFullYear()} {APP_NAME}. {t.footer_rights}
          </p>
          <LanguageSwitcher current={lang} />
        </div>
      </div>
    </footer>
  );
}
