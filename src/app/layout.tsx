import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { EVENT } from "@/lib/event";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `${EVENT.name} — ${EVENT.theme} | ${EVENT.host}`,
  description: `Register for ${EVENT.name}: "${EVENT.theme}". ${EVENT.datesLabel} at ${EVENT.venue.name}, Ota.`,
  icons: { icon: "/images/lfc-logo.gif" },
  openGraph: {
    title: `${EVENT.name} — ${EVENT.theme}`,
    description: `The annual convocation of ${EVENT.host}. Register free today.`,
    images: ["/images/canaanland.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${manrope.variable} ${fraunces.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
