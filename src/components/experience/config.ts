// Layout of the Canaanland scene. Units are metres, origin near Faith
// Tabernacle, x = east, z = south (see scripts/build-map.mjs).

import type { ServiceId } from "@/lib/services";

export type Vec3 = [number, number, number];

export type PlaceId = "ministers" | "programme" | "ministrations" | "testimonies" | "directions" | ServiceId;

export type Place = {
  id: PlaceId;
  label: string;
  anchor: Vec3;
  camera: { position: Vec3; target: Vec3 };
};

// Faith Tabernacle, measured from its OpenStreetMap footprint: three long
// wings meeting at a central core crowned by the pyramid roof and spire.
export type Wing = { id: string; inner: [number, number]; angle: number; length: number; width: number; front?: boolean };

export const CORE = { x: 12, z: -30, radius: 50 };
export const WALL_HEIGHT = 20;

export const WINGS: Wing[] = [
  { id: "west", inner: [-32, -36.5], angle: Math.PI + 0.215, length: 98, width: 47 },
  { id: "north-east", inner: [35.3, -57.9], angle: -0.808, length: 99, width: 46 },
  { id: "front", inner: [20, 11.8], angle: 1.318, length: 103, width: 50, front: true },
];

/** Point along a wing: `along` metres from the core, `across` metres sideways. */
export function wingPoint(wing: Wing, along: number, across = 0): [number, number] {
  const c = Math.cos(wing.angle);
  const s = Math.sin(wing.angle);
  return [wing.inner[0] + c * along - s * across, wing.inner[1] + s * along + c * across];
}

// Named entrances. `side` is "end" for the outer end of a wing, or -1 / 1 for
// a door on one of its long sides at `along` metres from the core.
export type Entrance = { name: string; wing: string; side: "end" | -1 | 1; along?: number };

export const ENTRANCES: Entrance[] = [
  { name: "Honour Entrance", wing: "north-east", side: "end" },
  { name: "Grace Entrance", wing: "west", side: "end" },
];

/** Ground position just outside an entrance, `out` metres from the wall. */
export function entrancePoint(entrance: Entrance, out = 0): [number, number] {
  const wing = WINGS.find((w) => w.id === entrance.wing)!;
  if (entrance.side === "end") return wingPoint(wing, wing.length + out);
  return wingPoint(wing, entrance.along ?? wing.length / 2, entrance.side * (wing.width / 2 + out));
}

const honour = ENTRANCES.find((e) => e.name === "Honour Entrance")!;
const [honourX, honourZ] = entrancePoint(honour, 6);
const [honourCamX, honourCamZ] = entrancePoint(honour, 120);

const wingEnd = (id: string, inset = 0) => {
  const wing = WINGS.find((w) => w.id === id)!;
  return wingPoint(wing, wing.length - inset);
};

const [westX, westZ] = wingEnd("west", 10);
const [frontX, frontZ] = wingEnd("front", -8);

export const ALTAR: Vec3 = [CORE.x, 0, CORE.z];
export const GATE: Vec3 = [31, 0, -596];
// The Ark: an oval stadium bowl. `radius` is the short (north–south) half-axis;
// the east–west half-axis is radius × stretch.
export const ARK = { x: 25, z: -345, radius: 100, stretch: 1.2, height: 52 };

export const PLACES: Place[] = [
  {
    id: "ministers",
    label: "Ministers",
    anchor: [CORE.x, 34, CORE.z],
    // Down the front wing, over the congregation, facing the altar screen.
    camera: { position: [CORE.x + 24, 29, CORE.z + 56], target: [CORE.x + 13, 18, CORE.z + 8] },
  },
  {
    id: "programme",
    label: "Programme",
    anchor: [westX, 40, westZ],
    camera: { position: [-340, 150, 60], target: [-80, 10, -47] },
  },
  {
    id: "ministrations",
    label: "Ministrations",
    anchor: [frontX, 32, frontZ],
    // Close on the altar screen facing the front wing, where past Shiloh ministrations play.
    camera: { position: [CORE.x + 10, 23, CORE.z + 40], target: [CORE.x + 2, 19, CORE.z + 8] },
  },
  {
    id: "testimonies",
    label: "Testimonies",
    anchor: [honourX, 22, honourZ],
    camera: { position: [honourCamX, 70, honourCamZ], target: [honourX, 8, honourZ] },
  },
  {
    id: "directions",
    label: "Directions",
    anchor: [GATE[0], 30, GATE[2]],
    camera: { position: [280, 190, -840], target: GATE },
  },
];

// Practical services, each with its own landmark in Canaanland.
export const BUS_PARK: Vec3 = [-130, 0, -520];
export const HELP_DESK: Vec3 = [100, 0, 160];
export const BOOKSHOP: Vec3 = [-168, 0, -66];

const servicePlace = (id: ServiceId, label: string, at: Vec3, height: number, view: Vec3): Place => ({
  id,
  label,
  anchor: [at[0], height, at[2]],
  camera: { position: [at[0] + view[0], view[1], at[2] + view[2]], target: [at[0], 4, at[2]] },
});

export const SERVICE_PLACES: Place[] = [
  servicePlace("shuttles", "Shuttles", BUS_PARK, 16, [-150, 85, -40]),
  servicePlace("help", "Help desk", HELP_DESK, 16, [90, 55, 100]),
  servicePlace("bookshop", "Bookshop", BOOKSHOP, 18, [-100, 60, 80]),
];

export const SERVICE_IDS = new Set<PlaceId>(SERVICE_PLACES.map((p) => p.id));
export const ALL_PLACES = [...PLACES, ...SERVICE_PLACES];

export const OVERVIEW = { position: [430, 290, 470] as Vec3, target: [10, 0, -70] as Vec3 };

export const PILLARS = ["Prophetic Word", "Worship", "Signs & Wonders", "Testimonies"];

/** Areas kept clear of OpenStreetMap buildings so landmarks don't overlap them. */
export const CLEARINGS: { x: number; z: number; r: number }[] = [
  { x: CORE.x, z: CORE.z, r: 175 },
  { x: frontX, z: frontZ + 30, r: 70 },
  { x: ARK.x, z: ARK.z, r: ARK.radius * ARK.stretch + 20 },
  { x: BUS_PARK[0], z: BUS_PARK[2], r: 70 },
  { x: HELP_DESK[0], z: HELP_DESK[2], r: 30 },
  { x: BOOKSHOP[0], z: BOOKSHOP[2], r: 30 },
];

export type MapData = {
  attribution: string;
  roadClasses: string[];
  tabernacle: [number, number][];
  roads: number[][];
  buildings: number[][];
  labels: { name: string; x: number; z: number }[];
};

let mapPromise: Promise<MapData> | null = null;

export function loadMap(onProgress?: (fraction: number) => void): Promise<MapData> {
  mapPromise ??= (async () => {
    const response = await fetch("/experience/ota.json");
    if (!response.ok || !response.body) throw new Error("Could not load map data");
    const total = Number(response.headers.get("content-length")) || 1_100_000;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      received += value.length;
      onProgress?.(Math.min(received / total, 0.99));
    }
    const text = new TextDecoder().decode(await new Blob(chunks as BlobPart[]).arrayBuffer());
    onProgress?.(1);
    return JSON.parse(text) as MapData;
  })();
  return mapPromise;
}
