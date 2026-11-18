import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "./logo";
import { APP_NAME, TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              {TAGLINE} Trusted professionals for every corner of your home.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Platform</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li><Link href="/services" className="hover:text-navy">Browse services</Link></li>
              <li><Link href="/register?role=provider" className="hover:text-navy">Become a provider</Link></li>
              <li><Link href="/about" className="hover:text-navy">About us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Support</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li><Link href="/contact" className="hover:text-navy">Contact us</Link></li>
              <li><Link href="/contact" className="hover:text-navy">Report an issue</Link></li>
              <li><Link href="/login" className="hover:text-navy">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">Get in touch</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@fixora.example</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 010-2030</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Portland, OR</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">
          {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
