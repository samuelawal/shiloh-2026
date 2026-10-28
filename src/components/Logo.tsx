import Image from "next/image";
import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Shiloh 2026 home">
      <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-white p-1 shadow">
        <Image src="/images/lfc-logo.gif" alt="Living Faith Church Worldwide logo" width={40} height={44} unoptimized />
      </span>
      <span className="leading-tight">
        <span className={`block font-display text-lg font-semibold ${light ? "text-white" : "text-ink"}`}>
          Shiloh 2026
        </span>
        <span className={`block text-[11px] font-semibold tracking-wide ${light ? "text-white" : "text-muted"}`}>
          Living Faith Church Worldwide
        </span>
      </span>
    </Link>
  );
}
