// Shiloh 2026 brand marks, drawn from the official "Far Above" flyer.

/** The circled "Shiloh 2026" script badge. Inherits the text colour. */
export function ShilohMark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-grid aspect-square place-items-center rounded-full border-[1.5px] border-current ${className}`}
      aria-label="Shiloh 2026"
    >
      <span className="-mt-[0.3em] -rotate-6 font-script text-[0.82em] leading-none" aria-hidden>
        Shiloh
      </span>
      <span className="absolute bottom-[0.55em] text-[0.32em] font-bold tracking-[0.3em] leading-none" aria-hidden>
        2026
      </span>
    </span>
  );
}

/** An Anton "A" without its crossbar: a V turned upside down, as on the flyer. */
function Peak() {
  return <span className="inline-block -translate-y-[0.025em] rotate-180">V</span>;
}

/** "FAR ABOVE" set the way the flyer sets it. Size it with a font-size class. */
export function FarAbove({ className = "", stacked = true }: { className?: string; stacked?: boolean }) {
  return (
    <span className={`font-display leading-[0.86] tracking-tight uppercase ${className}`} aria-label="Far Above">
      <span aria-hidden className={stacked ? "block" : "inline"}>
        F<Peak />R
      </span>
      {!stacked && " "}
      <span aria-hidden className={stacked ? "block" : "inline"}>
        <Peak />BOVE
      </span>
    </span>
  );
}
