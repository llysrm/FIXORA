"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type ActionState } from "@/lib/actions/auth";
import { Input, Label, Alert } from "./ui";
import { SubmitButton } from "./submit-button";
import { LANG_COOKIE, normalizeLang, type Lang } from "@/lib/constants";

const labels: Record<Lang, {
  email: string; password: string; passwordPlaceholder: string; login: string;
  noAccount: string; signup: string; emailPlaceholder: string;
  iWant: string; book: string; offer: string; providerNote: string;
  fullName: string; namePlaceholder: string; businessName: string; businessPlaceholder: string;
  city: string; cityPlaceholder: string; passwordMin: string; createAccount: string; haveAccount: string;
}> = {
  en: {
    email: "Email", password: "Password", passwordPlaceholder: "Your password",
    login: "Log in", noAccount: "No account yet?", signup: "Sign up",
    emailPlaceholder: "name@domain.com",
    iWant: "I want to", book: "Book services", offer: "Offer services",
    providerNote: "Provider accounts are reviewed by our admin before going live.",
    fullName: "Full name", namePlaceholder: "Full name",
    businessName: "Business name", businessPlaceholder: "Business name",
    city: "City", cityPlaceholder: "City",
    passwordMin: "At least 8 characters", createAccount: "Create account",
    haveAccount: "Already have an account?",
  },
  id: {
    email: "Email", password: "Kata sandi", passwordPlaceholder: "Kata sandi Anda",
    login: "Masuk", noAccount: "Belum punya akun?", signup: "Daftar",
    emailPlaceholder: "nama@domain.com",
    iWant: "Saya ingin", book: "Pesan layanan", offer: "Menawarkan layanan",
    providerNote: "Akun penyedia ditinjau admin kami sebelum aktif.",
    fullName: "Nama lengkap", namePlaceholder: "Nama lengkap",
    businessName: "Nama usaha", businessPlaceholder: "Nama usaha",
    city: "Kota", cityPlaceholder: "Kota",
    passwordMin: "Minimal 8 karakter", createAccount: "Buat akun",
    haveAccount: "Sudah punya akun?",
  },
};

function useLang(): Lang {
  if (typeof document === "undefined") return "id";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LANG_COOKIE}=([^;]*)`));
  return normalizeLang(match ? decodeURIComponent(match[1]) : undefined);
}

const initial: ActionState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initial);
  const lang = useLang();
  const t = labels[lang];
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder={t.emailPlaceholder} />
      </div>
      <div>
        <Label htmlFor="password">{t.password}</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder={t.passwordPlaceholder} />
      </div>
      <SubmitButton className="w-full" size="lg">{t.login}</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        {t.noAccount}{" "}
        <Link href="/register" className="font-medium text-blue hover:text-blue-dark">{t.signup}</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ defaultRole = "customer" }: { defaultRole?: string }) {
  const [state, formAction] = useActionState(registerAction, initial);
  const lang = useLang();
  const t = labels[lang];
  return (
    <form action={formAction} className="space-y-4">
      {state.error && <Alert kind="error">{state.error}</Alert>}
      <fieldset>
        <Label>{t.iWant}</Label>
        <div className="grid grid-cols-2 gap-2">
          <label className="cursor-pointer">
            <input type="radio" name="role" value="customer" defaultChecked={defaultRole !== "provider"} className="peer sr-only" />
            <div className="rounded-lg border border-line px-4 py-3 text-center text-sm font-medium text-ink-soft peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white">
              {t.book}
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="role" value="provider" defaultChecked={defaultRole === "provider"} className="peer sr-only" />
            <div className="rounded-lg border border-line px-4 py-3 text-center text-sm font-medium text-ink-soft peer-checked:border-navy peer-checked:bg-navy peer-checked:text-white">
              {t.offer}
            </div>
          </label>
        </div>
        <p className="mt-1.5 text-xs text-ink-soft">{t.providerNote}</p>
      </fieldset>
      <div>
        <Label htmlFor="name">{t.fullName}</Label>
        <Input id="name" name="name" autoComplete="name" required placeholder={t.namePlaceholder} />
      </div>
      <div id="provider-fields" className="grid gap-4">
        <div>
          <Label htmlFor="businessName">{t.businessName}</Label>
          <Input id="businessName" name="businessName" placeholder={t.businessPlaceholder} />
        </div>
        <div>
          <Label htmlFor="city">{t.city}</Label>
          <Input id="city" name="city" placeholder={t.cityPlaceholder} />
        </div>
      </div>
      <div>
        <Label htmlFor="email">{t.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder={t.emailPlaceholder} />
      </div>
      <div>
        <Label htmlFor="password">{t.password}</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} placeholder={t.passwordMin} />
      </div>
      <SubmitButton className="w-full" size="lg">{t.createAccount}</SubmitButton>
      <p className="text-center text-sm text-ink-soft">
        {t.haveAccount}{" "}
        <Link href="/login" className="font-medium text-blue hover:text-blue-dark">{t.login}</Link>
      </p>
    </form>
  );
}
