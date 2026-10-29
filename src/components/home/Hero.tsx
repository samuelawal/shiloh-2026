import Link from "next/link";
import { FarAbove } from "@/components/Brand";
import { Countdown } from "@/components/Countdown";
import { EVENT, LINKS, MINISTERING } from "@/lib/event";

function YouTubeIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 28 20" className={className} aria-hidden>
      <rect width="28" height="20" rx="5" fill="#ff0033" />
      <path d="M11 6v8l7-4z" fill="#fff" />
    </svg>
  );
}

const DETAILS = [
  { label: "Date", value: "8th – 13th Dec. 2026" },
  { label: "Time", value: EVENT.timesLabel },
  { label: "Venue", value: "Faith Tabernacle Canaanland" },
  { label: "Broadcast", value: EVENT.broadcast },
];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="flyer-sky relative isolate pt-28 pb-12 sm:pt-36">
        <div className="halftone absolute inset-0 -z-10" aria-hidden />
        <div className="container-page">
          <p className="text-xs font-bold tracking-[0.3em] text-ink uppercase">
            {EVENT.host} presents Shiloh 2026
          </p>

          <h1 className="mt-4 text-ink">
            <FarAbove className="text-[27vw] drop-shadow-[0_6px_30px_rgb(255_190_92_/_0.45)] sm:text-[11rem] lg:text-[14rem]" />
          </h1>
          <p className="mt-4 font-display text-2xl tracking-[0.3em] text-umber sm:text-3xl">
            EPH. 1:20–21
          </p>
        </div>
      </div>

      <div className="flyer-earth relative isolate pt-12 pb-20 sm:pt-16 sm:pb-28">
        <div className="halftone-light absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,transparent,black_35%,transparent)]" aria-hidden />
        <div className="container-page">
          <dl className="grid max-w-3xl grid-cols-2 gap-x-6 gap-y-7 sm:mt-20 sm:gap-x-12">
            {DETAILS.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-[10px] font-bold tracking-[0.45em] text-accent-soft uppercase sm:text-xs">
                  {label}:
                </dt>
                <dd className="mt-1 font-display text-xl leading-tight text-cream uppercase sm:text-3xl">
                  {value}
                </dd>
              </div>
            ))}
            <div>
              <dt className="text-[10px] font-bold tracking-[0.45em] text-accent-soft uppercase sm:text-xs">
                Ministering:
              </dt>
              <dd className="mt-1 font-display text-xl leading-tight text-cream uppercase sm:text-3xl">
                {MINISTERING.lead}
              </dd>
              <dd className="mt-1 text-[10px] font-semibold text-cream uppercase sm:text-xs">
                {MINISTERING.others}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold tracking-[0.45em] text-accent-soft uppercase sm:text-xs">
                Live stream on:
              </dt>
              <dd className="mt-1">
                <a
                  href={LINKS.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-start gap-2 font-display text-xl leading-tight text-cream uppercase hover:text-white sm:text-3xl"
                >
                  <YouTubeIcon className="mt-1 h-5 w-7 shrink-0 sm:h-6 sm:w-9" />{" "}
                  {EVENT.host}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-14 max-w-lg">
            <Countdown to={EVENT.startsAt} />
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/simple#ministrations" className="btn-primary px-8 py-4 text-base">
            Watch Past Shiloh
          </Link>
            <Link
              href="/simple#programme"
              className="btn-outline px-8 py-4 text-base"
            >
              View Programme
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
