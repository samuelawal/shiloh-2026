import { MinisterAvatar } from "@/components/MinisterAvatar";
import { SectionHeader } from "@/components/SectionHeader";
import { HOST, MINISTERING, MINISTERS, PHOTO_CREDITS } from "@/lib/event";

export function Ministers() {
  return (
    <section id="ministers" className="sky-gradient relative isolate scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="halftone-light absolute inset-0 -z-10" aria-hidden />
      <div className="container-page">
        <SectionHeader
          light
          eyebrow="Ministering"
          title="Preaching at Shiloh 2026"
          description={`${MINISTERING.lead} ${MINISTERING.others.replace(/^And/, "and")}.`}
        />

        <article className="mb-8 grid items-center gap-6 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur sm:grid-cols-[auto_1fr] sm:p-8">
          <MinisterAvatar minister={HOST} size={132} className="ring-4 ring-accent/60" />
          <div>
            <p className="text-xs font-bold tracking-[0.3em] text-accent uppercase">Host</p>
            <h3 className="mt-1 font-display text-3xl text-white uppercase sm:text-4xl">{HOST.name}</h3>
            <p className="text-sm font-semibold text-accent-soft">{HOST.role}</p>
            <p className="mt-3 text-sm leading-relaxed text-white">{HOST.bio}</p>
          </div>
        </article>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MINISTERS.slice(1).map((minister) => (
            <li key={minister.name} className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
              <MinisterAvatar minister={minister} size={64} />
              <p className="font-bold text-white">{minister.name}</p>
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-[11px] text-white/70">
          Photos:{" "}
          {PHOTO_CREDITS.map((c, i) => (
            <span key={c.url}>
              {i > 0 && " · "}
              <a href={c.url} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {c.subject}
              </a>{" "}
              by {c.author}
            </span>
          ))}
          , Wikimedia Commons, CC BY-SA 4.0
        </p>
      </div>
    </section>
  );
}
