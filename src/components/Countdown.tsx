"use client";

import { useEffect, useState } from "react";

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function getRemaining(target: number): Remaining {
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ to }: { to: string }) {
  const target = new Date(to).getTime();
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(getRemaining(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const units: [string, number | undefined][] = [
    ["Days", remaining?.days],
    ["Hours", remaining?.hours],
    ["Mins", remaining?.minutes],
    ["Secs", remaining?.seconds],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" role="timer" aria-label="Time until Shiloh 2026 begins">
      {units.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-white/15 bg-white/10 px-2 py-3 text-center backdrop-blur sm:px-5 sm:py-4">
          <div className="font-display text-2xl text-white tabular-nums sm:text-4xl">
            {value === undefined ? "--" : String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-[10px] font-bold tracking-widest text-white uppercase sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}
