import { Church, Sparkles, Users } from "lucide-react";
import Image from "next/image";
import { EVENT } from "@/lib/event";

const HIGHLIGHTS = [
  { icon: Sparkles, title: "Prophetic Word", text: "Six days of covenant teaching that lifts you far above every limitation." },
  { icon: Users, title: "Global Gathering", text: "Hundreds of thousands of believers from over 70 nations in one place." },
  { icon: Church, title: "Signs & Wonders", text: "Healing, deliverance and testimonies that bear witness to God's word." },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-20 overflow-x-clip py-20 sm:py-28">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow">About Shiloh</p>
          <h2 className="heading mt-3">A divine encounter in the Home of Signs and Wonders</h2>
          <p className="mt-5 leading-relaxed text-muted">
            Shiloh is the annual convocation of {EVENT.host}, held at {EVENT.venue.name}, Ota. Every December,
            believers from across the world gather for a week of the Word, worship and wonders under the ministry of{" "}
            {EVENT.convener}.
          </p>

          <figure className="mt-8 rounded-2xl border-l-4 border-accent bg-white p-6 shadow-sm">
            <p className="text-xs font-bold tracking-widest text-sun uppercase">This year&apos;s theme · {EVENT.theme}</p>
            <blockquote className="mt-3 text-lg leading-relaxed font-semibold text-ink">
              &ldquo;{EVENT.scripture.text}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-sm font-semibold text-muted">— {EVENT.scripture.reference}</figcaption>
          </figure>

          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="size-6 text-sun" />
                <h3 className="mt-2 font-bold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-3 -z-10 rotate-2 rounded-3xl bg-gradient-to-br from-accent/40 to-sun/30" aria-hidden />
          <Image
            src="/images/canaanland.jpg"
            alt="The entrance gate to Canaanland, Ota — home of Faith Tabernacle"
            width={1024}
            height={755}
            className="rounded-3xl object-cover shadow-xl"
            priority
          />
          <p className="mt-3 text-center text-xs text-muted">Canaanland, Ota — Home of Signs and Wonders</p>
        </div>
      </div>
    </section>
  );
}
