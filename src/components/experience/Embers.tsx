"use client";

import { useEffect, useRef } from "react";

type Ember = { x: number; y: number; r: number; vx: number; vy: number; life: number; max: number };

/** Drifting golden sparks drawn on a 2D canvas above the scene. */
export function Embers({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio, 2);
    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const spawn = (anywhere: boolean): Ember => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 10,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.15 + Math.random() * 0.5),
      life: 0,
      max: 400 + Math.random() * 600,
    });
    const embers = Array.from({ length: Math.round(70 * density) }, () => spawn(true));

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin((e.life + i * 30) / 60) * 0.2;
        e.y += e.vy;
        const fade = Math.sin(Math.PI * Math.min(1, e.life / e.max));
        if (e.life > e.max || e.y < -10) embers[i] = spawn(false);
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        g.addColorStop(0, `rgba(255, 196, 186, ${0.9 * fade})`);
        g.addColorStop(0.4, `rgba(230, 40, 48, ${0.4 * fade})`);
        g.addColorStop(1, "rgba(212, 17, 28, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}
