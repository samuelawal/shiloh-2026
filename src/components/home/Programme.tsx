"use client";

import { Clock } from "lucide-react";
import { useState } from "react";
import { SectionHeader } from "@/components/SectionHeader";
import { EVENT, PROGRAMME } from "@/lib/event";

export function Programme() {
  const [active, setActive] = useState(0);
  const day = PROGRAMME[active];

  return (
    <section id="programme" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="Programme"
          title="Six days far above"
          description={`${EVENT.datesLabel}. All times are West Africa Time (WAT).${
            EVENT.datesConfirmed ? "" : " The schedule will be updated once the official programme is published."
          }`}
        />

        <div role="tablist" aria-label="Programme days" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:justify-center">
          {PROGRAMME.map((item, index) => (
            <button
              key={item.day}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-controls="programme-panel"
              onClick={() => setActive(index)}
              className={`shrink-0 rounded-2xl border px-5 py-3 text-left transition ${
                index === active
                  ? "border-umber bg-umber text-white shadow-lg"
                  : "border-black/10 bg-cream text-ink hover:border-umber/40"
              }`}
            >
              <span className={`block text-xs font-bold tracking-widest uppercase ${index === active ? "text-accent" : "text-sun"}`}>
                {item.day}
              </span>
              <span className="block text-sm font-semibold">{item.date}</span>
            </button>
          ))}
        </div>

        <div id="programme-panel" role="tabpanel" className="mx-auto mt-10 max-w-3xl">
          <h3 className="font-display text-2xl">{day.title}</h3>
          <ol className="mt-6 space-y-4">
            {day.sessions.map((session) => (
              <li key={session.time + session.title} className="card flex items-start gap-5">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-umber">
                  <Clock className="size-3.5" /> {session.time}
                </span>
                <div>
                  <p className="font-bold">{session.title}</p>
                  {session.note && <p className="mt-0.5 text-sm text-muted">{session.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
