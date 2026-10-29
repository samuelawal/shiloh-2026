import type { Metadata } from "next";
import { Anton, Kaushan_Script, Manrope } from "next/font/google";
import { EVENT } from "@/lib/event";
import "./globals.css";

// Shiloh 2026 branding: Anton for the condensed headlines, Kaushan Script for the Shiloh wordmark.
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const kaushan = Kaushan_Script({ subsets: ["latin"], weight: "400", variable: "--font-kaushan" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${EVENT.name} — ${EVENT.theme} | ${EVENT.host}`,
  description: `${EVENT.name}: "${EVENT.theme}". ${EVENT.datesLabel} at ${EVENT.venue.name}, Ota. Free and open to all.`,
  openGraph: {
    title: `${EVENT.name} — ${EVENT.theme}`,
    description: `The annual convocation of ${EVENT.host}. Free and open to all.`,
    images: ["/images/canaanland.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${anton.variable} ${kaushan.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
