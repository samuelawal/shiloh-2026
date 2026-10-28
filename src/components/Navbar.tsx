"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { href: "/simple#about", label: "About" },
  { href: "/simple#programme", label: "Programme" },
  { href: "/simple#ministers", label: "Ministers" },
  { href: "/simple#travel", label: "Travel & Stay" },
  { href: "/simple#faq", label: "FAQ" },
  { href: "/simple#give", label: "Give" },
  { href: "/", label: "Enter Canaanland" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/simple" && !scrolled;

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
        overHero && !open ? "bg-transparent" : "bg-night/95 shadow-lg backdrop-blur"
      }`}
    >
      <nav className="container-page flex h-18 items-center justify-between">
        <Logo light />

        <ul className="hidden items-center gap-7 lg:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm font-semibold text-white transition hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link href="/register" className="btn-primary hidden py-2.5 sm:inline-flex">
            Register Free
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-white lg:hidden"
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
            <Link href="/register" className="btn-primary w-full">
              Register Free
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
