import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/lang";
import { getDict } from "@/lib/dictionaries";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = getDict(lang);
  const title = `${APP_NAME} | ${lang === "id" ? "Solusi Layanan Rumah" : "Home Service Solution"}`;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${APP_NAME}`,
    },
    description: t.hero_subtitle,
    openGraph: {
      title,
      description: t.hero_subtitle,
      url: siteUrl,
      siteName: APP_NAME,
      type: "website",
      images: [{ url: "/api/og", width: 1200, height: 630, alt: APP_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t.hero_subtitle,
      images: ["/api/og"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
