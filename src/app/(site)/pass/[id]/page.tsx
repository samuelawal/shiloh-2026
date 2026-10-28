import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PassQrCode } from "@/components/pass/PassQrCode";
import { PrintButton } from "@/components/pass/PrintButton";
import { EVENT } from "@/lib/event";
import { ACCOMMODATION, CATEGORIES, labelFor } from "@/lib/registration";
import { findRegistration } from "@/lib/store";

// Passes contain personal details, so keep them out of search engines.
export const metadata: Metadata = {
  title: `Delegate Pass | ${EVENT.name}`,
  robots: { index: false, follow: false },
};

export default async function PassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registration = await findRegistration(id);
  if (!registration) notFound();

  const details = [
    ["Category", labelFor(CATEGORIES, registration.category)],
    ["Party size", String(registration.groupSize)],
    ["Days", registration.days.length === 6 ? "All days" : registration.days.join(", ")],
    ["Accommodation", labelFor(ACCOMMODATION, registration.accommodation)],
  ];

  return (
    <>
      <PageHeader
        eyebrow="You're registered"
        title={`See you at Shiloh, ${registration.firstName}!`}
        description="Save this pass on your phone or print it. Present it at the delegate desk when you arrive."
      />

      <div className="container-page max-w-xl py-12 sm:py-16 print:py-0">
        <article className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5 print:shadow-none">
          <header className="sky-gradient flex items-center justify-between gap-4 px-6 py-5 text-white print:[print-color-adjust:exact]">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-white p-1">
                <Image src="/images/lfc-logo.gif" alt="" width={40} height={44} unoptimized />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">{EVENT.name}</p>
                <p className="text-xs text-white">&ldquo;{EVENT.theme}&rdquo;</p>
              </div>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-night uppercase">Delegate</span>
          </header>

          <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold tracking-widest text-muted uppercase">Name</p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {registration.firstName} {registration.lastName}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
                {details.map(([term, value]) => (
                  <div key={term}>
                    <dt className="text-xs font-bold tracking-widest text-muted uppercase">{term}</dt>
                    <dd className="mt-0.5 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-col items-center gap-2">
              <PassQrCode value={registration.id} />
              <p className="font-mono text-sm font-bold tracking-wider">{registration.id}</p>
            </div>
          </div>

          <footer className="border-t border-dashed border-black/15 px-6 py-4 text-xs text-muted">
            {EVENT.datesLabel} · {EVENT.venue.name}, Ota
          </footer>
        </article>

        <p className="no-print mt-6 flex items-center justify-center gap-2 text-sm text-muted">
          <CheckCircle2 className="size-4 text-green-600" /> Registered with {registration.email}
        </p>

        <div className="no-print mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <PrintButton />
          <Link href="/simple#programme" className="btn border border-deep/20 text-deep hover:bg-deep hover:text-white">
            View programme
          </Link>
        </div>
      </div>
    </>
  );
}
