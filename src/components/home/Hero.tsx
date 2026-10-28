import { Bird, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { EVENT } from "@/lib/event";

export function Hero() {
  return (
    <section className="sky-gradient relative isolate overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div className="stars absolute inset-0 -z-10" aria-hidden />
      <div className="clouds absolute inset-x-0 bottom-0 -z-10 h-56" aria-hidden />
      <Bird
        aria-hidden
        strokeWidth={0.6}
        className="absolute top-24 -right-16 -z-10 size-[420px] -rotate-12 text-white/[0.06] sm:right-0"
      />

      <div className="container-page text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-widest text-accent uppercase backdrop-blur">
          {EVENT.host} presents
        </p>

        <h1 className="mt-6 font-display text-6xl font-semibold tracking-tight text-white sm:text-8xl">
          Shiloh <span className="text-accent">2026</span>
        </h1>
        <p className="mt-4 font-display text-3xl text-white italic sm:text-5xl">&ldquo;{EVENT.theme}&rdquo;</p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm font-semibold text-white sm:flex-row sm:gap-8">
          <span className="inline-flex items-center gap-2">
            <Calendar className="size-4 text-accent" /> {EVENT.datesLabel}
            {!EVENT.datesConfirmed && <span className="text-white">(TBC)</span>}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4 text-accent" /> {EVENT.venue.name}, Ota
          </span>
        </div>

        <div className="mx-auto mt-10 max-w-lg">
          <Countdown to={EVENT.startsAt} />
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary px-8 py-4 text-base">
            Register Free
          </Link>
          <Link href="/simple#programme" className="btn-outline px-8 py-4 text-base">
            View Programme
          </Link>
        </div>
      </div>
    </section>
  );
}
