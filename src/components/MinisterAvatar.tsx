import Image from "next/image";
import type { Minister } from "@/lib/event";

const initials = (name: string) =>
  name
    .replace(/^(Bishop|Pastor|Rev\.?)\s+/i, "")
    .split(/\s+/)
    .filter((part) => !part.endsWith(".") && part !== "Jnr")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

/** A round portrait, or the minister's initials until a photo is added. */
export function MinisterAvatar({ minister, size, className = "" }: { minister: Minister; size: number; className?: string }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-sun font-display text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {minister.photo ? (
        <Image src={minister.photo} alt={minister.name} fill sizes={`${size}px`} className="object-cover" />
      ) : (
        initials(minister.name)
      )}
    </span>
  );
}
