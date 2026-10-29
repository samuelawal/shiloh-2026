"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { HOST } from "@/lib/event";
import { embedUrl } from "@/lib/ministrations";
import { CORE, WINGS } from "./config";

// Hanging screens above the altar, one facing down each wing, showing the
// broadcast feed. Set VIDEO to a clip in /public (e.g. "/experience/altar.mp4")
// and it plays on the screens; until then they show the host preaching.
const VIDEO: string | null = null;
const PREACHING = "/images/ministers/david-oyedepo-preaching.jpg";
const W = 1280;
const H = 720;
const SCREEN = { width: 16, height: 9, y: 19, out: 8.5 };

function fontFamily(variable: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
}

/** Draws text in Anton with the flyer's crossbar-less A (a V turned over). */
function drawBrandText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number) {
  let cursor = x;
  for (const ch of text) {
    if (ch === "A") {
      const w = ctx.measureText("V").width;
      const cap = parseFloat(ctx.font) * 0.74;
      ctx.save();
      ctx.translate(cursor + w / 2, y - cap / 2);
      ctx.rotate(Math.PI);
      ctx.fillText("V", -w / 2, cap / 2);
      ctx.restore();
      cursor += w;
    } else {
      ctx.fillText(ch, cursor, y);
      cursor += ctx.measureText(ch).width;
    }
  }
}

function drawCover(ctx: CanvasRenderingContext2D, source: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, dw: number, dh: number, zoom: number) {
  const scale = Math.max(dw / sw, dh / sh) * zoom;
  const cw = dw / scale;
  const ch = dh / scale;
  ctx.drawImage(source, sx + (sw - cw) / 2, sy + (sh - ch) / 3, cw, ch, dx, dy, dw, dh);
}

function useFeed(lowPower: boolean) {
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  }, []);
  const texture = useMemo(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, [canvas]);
  const photo = useRef<HTMLImageElement | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const lastDraw = useRef(0);

  useEffect(() => {
    const img = new Image();
    img.src = PREACHING;
    img.onload = () => (photo.current = img);

    let el: HTMLVideoElement | null = null;
    if (VIDEO) {
      el = document.createElement("video");
      Object.assign(el, { src: VIDEO, muted: true, loop: true, playsInline: true });
      el.oncanplay = () => (video.current = el);
      void el.play().catch(() => {});
    }
    return () => {
      el?.pause();
      texture.dispose();
    };
  }, [texture]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (t - lastDraw.current < (lowPower ? 1 / 10 : 1 / 24)) return;
    lastDraw.current = t;
    const ctx = canvas.getContext("2d")!;
    const display = fontFamily("--font-anton", "Impact, sans-serif");
    const body = fontFamily("--font-manrope", "sans-serif");

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#2a1308");
    bg.addColorStop(0.6, "#7d3410");
    bg.addColorStop(1, "#e3893a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // The feed: the clip if there is one, otherwise the photo slowly pushing in.
    const source = video.current ?? photo.current;
    if (source) {
      const [sw, sh] = video.current ? [video.current.videoWidth, video.current.videoHeight] : [source.width as number, source.height as number];
      drawCover(ctx, source, 0, 0, sw, sh, 0, 0, W, H, video.current ? 1 : 1.04 + 0.04 * Math.sin(t * 0.15));
    }

    // Programme bug, top left: the Far Above wordmark.
    ctx.fillStyle = "rgba(20,10,5,0.6)";
    ctx.beginPath();
    ctx.roundRect(32, 30, 236, 118, 14);
    ctx.fill();
    ctx.fillStyle = "#f6efe3";
    ctx.font = `46px ${display}`;
    ctx.textBaseline = "alphabetic";
    drawBrandText(ctx, "FAR ABOVE", 52, 88);
    ctx.fillStyle = "#ffb547";
    ctx.font = `700 18px ${body}`;
    ctx.fillText("SHILOH 2026 · EPH. 1:20–21", 54, 124);

    // Lower third.
    ctx.fillStyle = "rgba(20,10,5,0.82)";
    ctx.fillRect(0, H - 130, W, 130);
    ctx.fillStyle = "#c9530b";
    ctx.fillRect(0, H - 130, 14, 130);
    ctx.fillStyle = "#f6efe3";
    ctx.font = `56px ${display}`;
    ctx.fillText(HOST.name.toUpperCase(), 44, H - 62);
    ctx.fillStyle = "#ffd9a3";
    ctx.font = `600 26px ${body}`;
    ctx.fillText(`${HOST.role} · Shiloh 2026`, 46, H - 24);

    // Live badge.
    const pulse = 0.55 + 0.45 * Math.sin(t * 4);
    ctx.fillStyle = "rgba(20,10,5,0.75)";
    ctx.beginPath();
    ctx.roundRect(W - 190, 32, 150, 52, 26);
    ctx.fill();
    ctx.fillStyle = `rgba(255,51,51,${pulse})`;
    ctx.beginPath();
    ctx.arc(W - 160, 58, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 26px ${body}`;
    ctx.fillText("LIVE", W - 138, 68);

    texture.needsUpdate = true;
  });

  return texture;
}

// drei's transformed Html maps distanceFactor / 400 world units to a CSS pixel,
// so a 1280 × 720 player exactly covers the 16 × 9 screen.
const PLAYER = { width: 1280, height: 720, distanceFactor: (SCREEN.width / 1280) * 400 };

export function StageScreens({ lowPower = false, playing }: { lowPower?: boolean; playing: string | null }) {
  const texture = useFeed(lowPower);
  return (
    <group position={[CORE.x, 0, CORE.z]}>
      {WINGS.map((wing) => {
        // Face outward along the wing, towards the congregation seated in it.
        const dx = Math.cos(wing.angle);
        const dz = Math.sin(wing.angle);
        return (
          <group key={wing.id} position={[dx * SCREEN.out, SCREEN.y, dz * SCREEN.out]} rotation-y={Math.atan2(dx, dz)}>
            <mesh position={[0, 0, -0.35]}>
              <boxGeometry args={[SCREEN.width + 0.8, SCREEN.height + 0.8, 0.6]} />
              <meshStandardMaterial color="#120c0a" roughness={0.5} />
            </mesh>
            <mesh>
              <planeGeometry args={[SCREEN.width, SCREEN.height]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
            {/* A real YouTube player on the screen facing the front wing. */}
            {wing.front && playing && (
              <Html transform distanceFactor={PLAYER.distanceFactor} position={[0, 0, 0.05]} zIndexRange={[20, 0]}>
                <iframe
                  key={playing}
                  src={embedUrl(playing)}
                  width={PLAYER.width}
                  height={PLAYER.height}
                  title="Past Shiloh ministration"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  className="block border-0 bg-black"
                />
              </Html>
            )}
            <mesh position={[0, SCREEN.height / 2 + 4, -0.35]}>
              <cylinderGeometry args={[0.12, 0.12, 8, 6]} />
              <meshStandardMaterial color="#3a2a2a" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
