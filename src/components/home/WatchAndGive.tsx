import { Globe, HeartHandshake, Radio, Tv } from "lucide-react";
import Link from "next/link";
import { LINKS } from "@/lib/event";

const CHANNELS = [
  { icon: Globe, label: "Faith Tabernacle website", href: LINKS.website },
  {
    icon: Tv,
    label: "Living Faith Church Worldwide on YouTube",
    href: LINKS.youtube,
  },
  { icon: Radio, label: "Domi Radio", href: LINKS.domiRadio },
];

export function WatchAndGive() {
  return (
    <section id="give" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <p className="eyebrow">Can&apos;t make it to Canaanland?</p>
          <h2 className="mt-3 font-display text-3xl uppercase sm:text-4xl">
            Join every session live
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Every session streams live on the Faith Tabernacle website, this
            Shiloh website, YouTube and Domi Radio. Many Shiloh viewing centres
            worldwide also stream live.
          </p>
          <ul className="mt-6 space-y-3">
            {CHANNELS.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3 font-semibold transition hover:border-umber hover:bg-umber hover:text-white">
                  <Icon className="size-5 text-sun" /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
