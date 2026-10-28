import { HeartHandshake, Radio, Tv } from "lucide-react";
import Link from "next/link";
import { LINKS } from "@/lib/event";

const CHANNELS = [
  { icon: Tv, label: "Faith Tabernacle on YouTube", href: LINKS.youtube },
  { icon: Tv, label: "Dominion TV", href: LINKS.dominionTv },
  { icon: Radio, label: "Domi Radio", href: LINKS.domiRadio },
];

export function WatchAndGive() {
  return (
    <section id="give" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <p className="eyebrow">Can&apos;t make it to Canaanland?</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Join every session live</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Shiloh streams live worldwide, and many branches link up so you can worship with your local church.
          </p>
          <ul className="mt-6 space-y-3">
            {CHANNELS.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 font-semibold transition hover:border-wine hover:bg-wine hover:text-white">
                  <Icon className="size-5 text-flame" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative isolate overflow-hidden rounded-2xl bg-flame p-8 text-white shadow-xl">
          <HeartHandshake aria-hidden strokeWidth={0.8} className="absolute -right-10 -bottom-10 -z-10 size-64 text-white/10" />
          <p className="text-xs font-bold tracking-[0.25em] text-white uppercase">Partner with Shiloh</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">Sow into the move of God</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white">
            Your giving helps host hundreds of thousands of delegates: feeding, transport, medical care and the broadcast
            that carries the Word to the nations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={LINKS.give} target="_blank" rel="noreferrer" className="btn bg-white text-flame hover:bg-cream">
              Give online
            </a>
            <Link href="/register" className="btn border border-white/50 hover:bg-white/10">
              Register free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
