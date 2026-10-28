import { SectionHeader } from "@/components/SectionHeader";
import { MINISTERS } from "@/lib/event";

const initials = (name: string) =>
  name
    .replace(/^(Bishop|Pastor|Rev\.?)\s+/i, "")
    .split(/\s+/)
    .filter((part) => !part.endsWith("."))
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

export function Ministers() {
  return (
    <section id="ministers" className="sky-gradient relative isolate scroll-mt-20 overflow-hidden py-20 sm:py-28">
      <div className="stars absolute inset-0 -z-10" aria-hidden />
      <div className="container-page">
        <SectionHeader
          light
          eyebrow="Ministering"
          title="Hear from God's servants"
          description="Shiloh is led by the Presiding Bishop with senior ministers of the Commission."
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MINISTERS.map((minister) => (
            <li
              key={minister.name}
              className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-flame font-display text-lg font-semibold text-white">
                {initials(minister.name)}
              </span>
              <div>
                <p className="font-bold text-white">{minister.name}</p>
                <p className="text-sm text-white">{minister.role}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
