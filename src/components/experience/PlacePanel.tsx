"use client";

import {
  ArrowRight,
  BookOpen,
  Bus,
  Clock,
  type LucideIcon,
  MapPin,
  Plane,
  Play,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MinisterAvatar } from "@/components/MinisterAvatar";
import {
  EVENT,
  HOST,
  LINKS,
  MINISTERS,
  PHOTO_CREDITS,
  PROGRAMME,
} from "@/lib/event";
import { MINISTRATIONS, thumbnail, watchUrl } from "@/lib/ministrations";
import { SERVICES, type ServiceId } from "@/lib/services";
import { type PlaceId, SERVICE_IDS } from "./config";

function Ministers() {
  return (
    <>
      <div className="flex items-center gap-4">
        <MinisterAvatar
          minister={HOST}
          size={84}
          className="ring-2 ring-accent/70"
        />
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase">
            Host
          </p>
          <p className="font-display text-xl leading-tight text-white uppercase">
            {HOST.name}
          </p>
          <p className="text-xs text-accent-soft">{HOST.role}</p>
        </div>
      </div>
      <p className="mt-4">{HOST.bio}</p>
      <p className="mt-6 text-[11px] font-bold tracking-[0.25em] text-accent uppercase">
        Ministering
      </p>
      <ul className="mt-3 grid grid-cols-2 gap-2.5">
        {MINISTERS.slice(1).map((m) => (
          <li
            key={m.name}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2 py-4 text-center">
            <MinisterAvatar minister={m} size={64} />
            <p className="text-xs leading-snug font-semibold text-white">
              {m.name}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Programme() {
  const [day, setDay] = useState(0);
  const current = PROGRAMME[day];
  return (
    <>
      <p>
        {EVENT.datesLabel}. Times are WAT
        {EVENT.datesConfirmed
          ? ""
          : " and will be confirmed when the official programme is out"}
        .
      </p>
      <div className="-mx-1 mt-5 flex gap-1.5 overflow-x-auto pb-1">
        {PROGRAMME.map((d, i) => (
          <button
            key={d.day}
            type="button"
            onClick={() => setDay(i)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
              i === day
                ? "bg-sun text-white"
                : "bg-white/10 text-white hover:bg-white/15"
            }`}>
            {d.day}
          </button>
        ))}
      </div>
      <h3 className="mt-5 font-display text-xl font-semibold text-white">
        {current.title}{" "}
        <span className="text-sm font-normal text-white">· {current.date}</span>
      </h3>
      <ol className="mt-3 space-y-2">
        {current.sessions.map((s) => (
          <li
            key={s.time + s.title}
            className="flex gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-accent">
              <Clock className="size-3.5" /> {s.time}
            </span>
            <span>
              <span className="block font-semibold text-white">{s.title}</span>
              {s.note && <span className="text-xs text-white">{s.note}</span>}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function Ministrations({
  playing,
  onPlay,
}: {
  playing: string | null;
  onPlay: (id: string) => void;
}) {
  const years = [...new Set(MINISTRATIONS.map((m) => m.year))];
  return (
    <>
      <p>
        Relive past Shiloh services from Faith Tabernacle. Choose a ministration
        and it plays on the altar screen, or open it on YouTube.
      </p>
      {years.map((year) => (
        <section key={year} className="mt-5">
          <p className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase">
            Shiloh {year} · {MINISTRATIONS.find((m) => m.year === year)!.theme}
          </p>
          <ul className="mt-2 space-y-2">
            {MINISTRATIONS.filter((m) => m.year === year).map((m) => {
              const active = playing === m.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => onPlay(m.id)}
                    aria-pressed={active}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                      active
                        ? "border-accent bg-accent/15"
                        : "border-white/10 bg-white/5 hover:border-white/30"
                    }`}>
                    <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-black">
                      <Image
                        src={thumbnail(m.id)}
                        alt=""
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                      <span className="absolute inset-0 grid place-items-center bg-black/30">
                        <Play className="size-5 fill-white text-white" />
                      </span>
                    </span>
                    <span>
                      <span className="block text-sm leading-snug font-semibold text-white">
                        {m.title}
                      </span>
                      <span className="text-xs text-accent-soft">
                        {active ? "Now playing on the altar screen" : m.date}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {playing && (
        <a
          href={watchUrl(playing)}
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-6 w-full">
          Watch on YouTube <ArrowRight className="size-4" />
        </a>
      )}
    </>
  );
}

function Testimonies() {
  return (
    <>
      <p>
        Testimonies are shared at the Honour Entrance of Faith Tabernacle. Come
        with your story of healing, breakthrough or salvation and the testimony
        team will receive you there.
      </p>
      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
        Testimonies from Shiloh 2026 will appear here during and after the
        programme.
      </div>
      <a
        href={LINKS.website}
        target="_blank"
        rel="noreferrer"
        className="btn-primary mt-7 w-full">
        Share your testimony <ArrowRight className="size-4" />
      </a>
    </>
  );
}

function Directions() {
  return (
    <>
      <p className="flex gap-2">
        <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
        {EVENT.venue.name}, {EVENT.venue.address}
      </p>
      <ul className="mt-5 space-y-3 text-sm">
        <li className="flex gap-3">
          <Plane className="size-4 shrink-0 text-accent" /> Fly into Murtala
          Muhammed Airport, Lagos — about 45 minutes by road.
        </li>
        <li className="flex gap-3">
          <Bus className="size-4 shrink-0 text-accent" /> Shiloh shuttles run
          from key points in Lagos and Ogun State.
        </li>
        <li className="flex gap-3">
          <MapPin className="size-4 shrink-0 text-accent" /> Enter through the
          Canaanland gate on Idi-Iroko Road.
        </li>
      </ul>
      <a
        href={EVENT.venue.mapUrl}
        target="_blank"
        rel="noreferrer"
        className="btn-primary mt-7 w-full">
        Open in Google Maps <ArrowRight className="size-4" />
      </a>
    </>
  );
}

export const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  shuttles: Bus,
  help: Users,
  bookshop: BookOpen,
};

function Services({
  active,
  onSelect,
}: {
  active: ServiceId;
  onSelect: (id: ServiceId) => void;
}) {
  const service = SERVICES.find((s) => s.id === active)!;
  const Icon = SERVICE_ICONS[active];
  return (
    <>
      <div
        role="tablist"
        aria-label="Services"
        className="flex flex-wrap gap-1.5">
        {SERVICES.map((s) => {
          const TabIcon = SERVICE_ICONS[s.id];
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={s.id === active}
              onClick={() => onSelect(s.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                s.id === active
                  ? "bg-sun text-white"
                  : "bg-white/10 text-white hover:bg-white/15"
              }`}>
              <TabIcon className="size-3.5" /> {s.title}
            </button>
          );
        })}
      </div>
      <h3 className="mt-5 flex items-center gap-2 font-display text-xl font-semibold text-white">
        <Icon className="size-5 text-accent" /> {service.title}
      </h3>
      <p className="mt-2">{service.summary}</p>
      <ul className="mt-4 space-y-2">
        {service.details.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{" "}
            {item}
          </li>
        ))}
      </ul>
      {service.cta && (
        <Link href={service.cta.href} className="btn-primary mt-7 w-full">
          {service.cta.label} <ArrowRight className="size-4" />
        </Link>
      )}
    </>
  );
}

const CONTENT: Record<
  Exclude<PlaceId, ServiceId | "ministrations">,
  { eyebrow: string; title: string; body: () => React.ReactNode }
> = {
  ministers: { eyebrow: "At the altar", title: "Ministers", body: Ministers },
  programme: { eyebrow: "Six days", title: "Programme", body: Programme },
  testimonies: {
    eyebrow: "Honour Entrance",
    title: "Testimonies",
    body: Testimonies,
  },
  directions: {
    eyebrow: "Getting here",
    title: "Directions",
    body: Directions,
  },
};

export function PlacePanel({
  place,
  playing,
  onSelect,
  onPlay,
  onClose,
}: {
  place: PlaceId;
  playing: string | null;
  onSelect: (id: PlaceId) => void;
  onPlay: (id: string) => void;
  onClose: () => void;
}) {
  const isService = SERVICE_IDS.has(place);
  const {
    eyebrow,
    title,
    body: Body,
  } = isService
    ? {
        eyebrow: "Practical help",
        title: "Services",
        body: () => (
          <Services active={place as ServiceId} onSelect={onSelect} />
        ),
      }
    : place === "ministrations"
      ? {
          eyebrow: "Past Shiloh",
          title: "Ministrations",
          body: () => <Ministrations playing={playing} onPlay={onPlay} />,
        }
      : CONTENT[place as Exclude<PlaceId, ServiceId | "ministrations">];
  return (
    <aside
      key={isService ? "services" : place}
      role="dialog"
      aria-label={title}
      className="animate-panel-in pointer-events-auto absolute inset-x-3 bottom-24 max-h-[62vh] overflow-y-auto rounded-3xl border border-white/10 bg-[#140a05]/80 p-6 text-sm leading-relaxed text-white shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:top-24 sm:right-6 sm:bottom-auto sm:max-h-[calc(100dvh-13rem)] sm:w-[400px] [@media(max-height:500px)]:top-[4.5rem] [@media(max-height:500px)]:max-h-[calc(100dvh-9rem)] [@media(max-height:500px)]:p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 rounded-full p-1.5 text-white transition hover:bg-white/10 hover:text-white">
        <X className="size-5" />
      </button>
      <p className="text-[11px] font-bold tracking-[0.25em] text-accent uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 mb-4 font-display text-3xl text-white uppercase [@media(max-height:500px)]:mb-2 [@media(max-height:500px)]:text-2xl">
        {title}
      </h2>
      <Body />
    </aside>
  );
}
