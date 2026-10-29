"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { LINKS } from "@/lib/event";
import { embedUrl, MINISTRATIONS, thumbnail } from "@/lib/ministrations";

export function Ministrations() {
  const [current, setCurrent] = useState(MINISTRATIONS[0]);
  // The YouTube player loads only once the visitor presses play.
  const [started, setStarted] = useState(false);
  const years = [...new Set(MINISTRATIONS.map((m) => m.year))];

  const play = (m: (typeof MINISTRATIONS)[number]) => {
    setCurrent(m);
    setStarted(true);
  };

  return (
    <section id="ministrations" className="scroll-mt-20 bg-night py-20 text-white sm:py-28">
      <div className="container-page">
        <SectionHeader
          light
          eyebrow="Past Shiloh"
          title="Relive the ministrations"
          description="Full services from Faith Tabernacle, Canaanland, as streamed on the Living Faith Church Worldwide YouTube channel."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl shadow-sun/20">
              {started ? (
                <iframe
                  key={current.id}
                  src={embedUrl(current.id)}
                  title={`Shiloh ${current.year}: ${current.title}`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 size-full border-0"
                />
              ) : (
                <button type="button" onClick={() => play(current)} className="group absolute inset-0" aria-label={`Play Shiloh ${current.year}: ${current.title}`}>
                  <Image src={thumbnail(current.id)} alt="" fill sizes="(min-width: 1024px) 760px, 100vw" className="object-cover opacity-80 transition group-hover:opacity-100" />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-20 place-items-center rounded-full bg-sun shadow-xl transition group-hover:scale-110">
                      <Play className="ml-1 size-8 fill-white text-white" />
                    </span>
                  </span>
                </button>
              )}
            </div>
            <p className="mt-4 text-xs font-bold tracking-[0.25em] text-accent uppercase">
              Shiloh {current.year} · {current.theme}
            </p>
            <h3 className="mt-1 font-display text-3xl uppercase">{current.title}</h3>
            <p className="text-sm text-accent-soft">{current.date} · Faith Tabernacle, Ota</p>
          </div>

          <div className="max-h-[560px] space-y-6 overflow-y-auto pr-1">
            {years.map((year) => (
              <div key={year}>
                <p className="mb-2 text-[11px] font-bold tracking-[0.25em] text-accent uppercase">
                  Shiloh {year} · {MINISTRATIONS.find((m) => m.year === year)!.theme}
                </p>
                <ul className="space-y-2">
                  {MINISTRATIONS.filter((m) => m.year === year).map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => play(m)}
                        aria-pressed={current.id === m.id}
                        className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                          current.id === m.id ? "border-accent bg-accent/15" : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-black">
                          <Image src={thumbnail(m.id)} alt="" fill sizes="112px" className="object-cover" />
                        </span>
                        <span>
                          <span className="block text-sm leading-snug font-semibold">{m.title}</span>
                          <span className="text-xs text-accent-soft">{m.date}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <a href={LINKS.youtube} target="_blank" rel="noreferrer" className="btn-outline w-full">
              More on YouTube
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
