import { BookOpen, Bus, type LucideIcon, Plane, Users } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { EVENT } from "@/lib/event";
import { SERVICES, type ServiceId } from "@/lib/services";

const ICONS: Record<ServiceId, LucideIcon> = {
  shuttles: Bus,
  help: Users,
  bookshop: BookOpen,
};

const EXTRAS = [
  {
    icon: Plane,
    title: "Arriving by air",
    summary:
      "Fly into Murtala Muhammed International Airport, Lagos. Canaanland is about 45 minutes away by road. The Shiloh protocol office at MM1 is there to receive and assist arriving delegates.",
  },
];

export function Travel() {
  return (
    <section id="travel" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader
          eyebrow="Travel & Services"
          title="Practical services for delegates"
          description={`${EVENT.venue.name}, ${EVENT.venue.address}.`}
        />

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = ICONS[service.id];
            return (
              <li key={service.id} id={service.id} className="card flex scroll-mt-24 flex-col">
                <span className="grid size-11 place-items-center rounded-xl bg-umber text-accent">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-4 font-bold">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.summary}</p>
                <ul className="mt-3 space-y-1.5 text-sm text-ink">
                  {service.details.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sun" /> {item}
                    </li>
                  ))}
                </ul>
                {service.cta && (
                  <Link href={service.cta.href} className="mt-5 text-sm font-bold text-sun hover:underline">
                    {service.cta.label} →
                  </Link>
                )}
              </li>
            );
          })}
          {EXTRAS.map(({ icon: Icon, title, summary }) => (
            <li key={title} className="card">
              <span className="grid size-11 place-items-center rounded-xl bg-umber text-accent">
                <Icon className="size-5" />
              </span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{summary}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <a href={EVENT.venue.mapUrl} target="_blank" rel="noreferrer" className="btn border border-umber/20 text-umber hover:bg-umber hover:text-white">
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
