import { CatmullRomCurve3, Vector3 } from "three";
import { OVERVIEW, type Vec3 } from "./config";

// Every beat below is cut to a phrase break in the voice recording
// (public/experience/shiloh-voice.m4a), measured from its loudness envelope:
// breaks at ~8.6 s, 13.6 s, 15.2 s, 17.4 s, 19.6 s, 21.1 s, 22.7 s and 24.7 s.
// Re-measure and update these if the recording changes.
export const INTRO_DURATION = 26;

type Shot = { t: number; position: Vec3; target: Vec3 };

const SHOTS: Shot[] = [
  { t: 0, position: [1900, 700, -1500], target: [800, 0, -700] },
  { t: 5.4, position: [1150, 280, -1080], target: [200, 20, -600] },
  { t: 9.1, position: [320, 140, -760], target: [30, 30, -420] },
  { t: 13.6, position: [170, 160, -210], target: [12, 40, -30] },
  { t: 17.3, position: [20, 250, 40], target: [12, 0, -30] },
  { t: 21.6, position: [-110, 60, 70], target: [12, 6, -30] },
  { t: INTRO_DURATION, position: OVERVIEW.position, target: OVERVIEW.target },
];

const toCurve = (points: Vec3[]) => new CatmullRomCurve3(points.map((p) => new Vector3(...p)), false, "centripetal");
const positionCurve = toCurve(SHOTS.map((s) => s.position));
const targetCurve = toCurve(SHOTS.map((s) => s.target));

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// Maps intro time to curve parameter so each shot lands exactly on its keyframe.
function curveParam(t: number) {
  const last = SHOTS.length - 1;
  for (let i = 0; i < last; i++) {
    const a = SHOTS[i];
    const b = SHOTS[i + 1];
    if (t <= b.t) {
      const local = (t - a.t) / (b.t - a.t);
      // Ease only the first and last legs; in between keep velocity continuous.
      const shaped = i === 0 ? local * local : i === last - 1 ? ease(local) : local;
      return (i + shaped) / last;
    }
  }
  return 1;
}

export function cameraAt(t: number, position: Vector3, target: Vector3) {
  const u = curveParam(Math.min(t, INTRO_DURATION));
  positionCurve.getPoint(u, position);
  targetCurve.getPoint(u, target);
}

// The light that travels along Idi-Iroko Road, over the Canaanland gate and The
// Ark, then down through the opened roof onto the altar of Faith Tabernacle.
const ORB_PATH = toCurve([
  [2300, 120, -760],
  [1300, 70, -640],
  [400, 50, -600],
  [31, 45, -560],
  [25, 75, -330],
  [40, 110, -90],
  [12, 70, -30],
  [12, 8, -30],
]);
const ORB_START = 0.6;
// Lands on the altar in the long pause at 15.2 s, just before the pillars.
const ORB_END = 16.1;

export function orbAt(t: number, out: Vector3) {
  const u = clamp01((t - ORB_START) / (ORB_END - ORB_START));
  ORB_PATH.getPointAt(smooth(u), out);
  return u;
}

export function roofOpacityAt(t: number) {
  if (t < 13.6) return 1;
  if (t < 16) return 1 - smooth((t - 13.6) / 2.4);
  if (t < 22.4) return 0;
  return smooth(clamp01((t - 22.4) / 2.5));
}

export type Cue = "travel" | "gate" | "tabernacle" | "pillars" | "title";

export const CUES: { cue: Cue; at: number }[] = [
  { cue: "travel", at: 0.6 },
  { cue: "gate", at: 9.1 },
  { cue: "tabernacle", at: 13.9 },
  { cue: "pillars", at: 16.3 },
  { cue: "title", at: 23.9 },
];

/** When each pillar word appears, relative to the "pillars" cue: one per phrase. */
export const PILLAR_DELAYS = [0, 2.3, 3.8, 5.5];

export function cueAt(t: number): Cue | null {
  let current: Cue | null = null;
  for (const { cue, at } of CUES) if (t >= at) current = cue;
  return current;
}
