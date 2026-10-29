"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LINKS } from "@/lib/event";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { href: "/simple#about", label: "About" },
  { href: "/simple#programme", label: "Programme" },
  { href: "/simple#ministers", label: "Ministers" },
  { href: "/simple#ministrations", label: "Ministrations" },
  { href: "/simple#travel", label: "Travel" },
  { href: "/simple#faq", label: "FAQ" },
  { href: "/simple#give", label: "Give" },
  { href: "/", label: "Enter Canaanland" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The /simple hero is the flyer's pale sky, so the bar reads dark until you scroll.
  const overHero = pathname === "/simple" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition ${
        overHero ? "bg-transparent" : "bg-night/95 shadow-lg backdrop-blur"
      }`}
    >
      <nav className="container-page flex h-18 items-center justify-between">
        <Logo light={!overHero} />

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={`text-sm font-semibold transition ${overHero ? "text-ink hover:text-sun" : "text-white hover:text-accent"}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a href={LINKS.youtube} target="_blank" rel="noreferrer" className="btn-primary hidden py-2.5 sm:inline-flex">
            Watch Live
          </a>
          <button
            type="button"
            className={`rounded-lg p-2 lg:hidden ${overHero ? "text-ink" : "text-white"}`}
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {open && (
        <ul className="container-page space-y-1 pb-6 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 font-semibold text-white hover:bg-white/10"
              >
                {item.label}
              </Link>
            </li>
          ))}
          <li className="pt-2">
            <a href={LINKS.youtube} target="_blank" rel="noreferrer" className="btn-primary w-full">
              Watch Live
            </a>
          </li>
        </ul>
      )}
    </header>
  );
}
