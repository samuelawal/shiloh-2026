import Image from "next/image";
import Link from "next/link";
import { ShilohMark } from "./Brand";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${light ? "text-white" : "text-ink"}`} aria-label="Shiloh 2026 home">
      <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-white p-1 shadow">
        <Image src="/images/lfc-logo.gif" alt="Living Faith Church Worldwide logo" width={40} height={44} unoptimized />
      </span>
      <ShilohMark className="size-12 text-[17px]" />
    </Link>
  );
}
