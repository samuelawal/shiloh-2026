import Link from "next/link";
import { EVENT, LINKS } from "@/lib/event";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="no-print bg-night text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed">
            {EVENT.name} is the annual convocation of {EVENT.host}, convened by {EVENT.convener}.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">Venue</h3>
          <p className="text-sm leading-relaxed">
            {EVENT.venue.name}
            <br />
            {EVENT.venue.address}
          </p>
          <a href={EVENT.venue.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-accent hover:underline">
            Get directions →
          </a>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold tracking-widest text-white uppercase">Quick links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/simple#ministrations" className="hover:text-white">Past ministrations</Link></li>
            <li><Link href="/simple#programme" className="hover:text-white">Programme</Link></li>
            <li><Link href="/simple#faq" className="hover:text-white">FAQ</Link></li>
            <li><a href={LINKS.website} target="_blank" rel="noreferrer" className="hover:text-white">faithtabernacle.org.ng</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs">
        © {new Date().getFullYear()} {EVENT.host}. All rights reserved.
      </div>
    </footer>
  );
}
