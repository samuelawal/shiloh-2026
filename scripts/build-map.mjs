// Builds public/experience/ota.json from OpenStreetMap data around Canaanland, Ota.
//
//   node scripts/build-map.mjs            # downloads from the Overpass API
//   node scripts/build-map.mjs raw.json   # uses a previously downloaded response
//
// Output is in metres, centred on Faith Tabernacle, with x = east and z = south
// (three.js convention). Buildings are reduced to oriented boxes so the client
// can render tens of thousands of them with a single instanced mesh.

import { readFile, writeFile, mkdir } from "node:fs/promises";

const BBOX = { roads: [6.64, 3.12, 6.715, 3.215], buildings: [6.655, 3.14, 6.7, 3.195] };
const ORIGIN = { lat: 6.67645, lon: 3.16728 }; // Faith Tabernacle centroid
const ROAD_RADIUS = 4200;
const BUILDING_RADIUS = 2600;

const ROAD_CLASSES = ["trunk", "primary", "secondary", "tertiary", "residential", "service"];
const roadClass = (highway) => {
  if (/^(motorway|trunk)/.test(highway)) return 0;
  if (/^primary/.test(highway)) return 1;
  if (/^secondary/.test(highway)) return 2;
  if (/^tertiary/.test(highway)) return 3;
  if (/^(residential|unclassified|living_street)/.test(highway)) return 4;
  return 5;
};

const query = `[out:json][timeout:120];(
  way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|unclassified|service|living_street"](${BBOX.roads});
  way["building"](${BBOX.buildings});
);out tags geom;`;

async function load() {
  const file = process.argv[2];
  if (file) return JSON.parse(await readFile(file, "utf8"));
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: new URLSearchParams({ data: query }),
    headers: { "User-Agent": "Shiloh2026Site/1.0" },
  });
  if (!response.ok) throw new Error(`Overpass responded ${response.status}`);
  return response.json();
}

const K_LAT = 111_320;
const K_LON = K_LAT * Math.cos((ORIGIN.lat * Math.PI) / 180);
const project = ({ lat, lon }) => [(lon - ORIGIN.lon) * K_LON, -(lat - ORIGIN.lat) * K_LAT];
const round = (n) => Math.round(n * 10) / 10;

// Smallest-area oriented rectangle, testing each edge direction of the footprint.
function orientedBox(points) {
  let best = null;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, az] = points[i];
    const [bx, bz] = points[i + 1];
    const angle = Math.atan2(bz - az, bx - ax);
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (const [x, z] of points) {
      const u = x * cos - z * sin;
      const v = x * sin + z * cos;
      minU = Math.min(minU, u); maxU = Math.max(maxU, u);
      minV = Math.min(minV, v); maxV = Math.max(maxV, v);
    }
    const area = (maxU - minU) * (maxV - minV);
    if (!best || area < best.area) {
      const cu = (minU + maxU) / 2;
      const cv = (minV + maxV) / 2;
      best = {
        area,
        x: cu * Math.cos(angle) - cv * Math.sin(angle),
        z: cu * Math.sin(angle) + cv * Math.cos(angle),
        w: maxU - minU,
        d: maxV - minV,
        angle,
      };
    }
  }
  return best;
}

// Deterministic pseudo-random height so rebuilds are stable.
const hash = (n) => {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

const raw = await load();
const roads = [];
const buildings = [];
const labels = new Map();
let tabernacle = null;

for (const el of raw.elements) {
  if (el.type !== "way" || !el.geometry) continue;
  const tags = el.tags ?? {};
  const points = el.geometry.map(project);

  if (/faith tab[ae]rnacle/i.test(tags.name ?? "")) {
    tabernacle = points.map(([x, z]) => [round(x), round(z)]);
    continue;
  }

  if (tags.highway) {
    if (!points.some(([x, z]) => Math.hypot(x, z) < ROAD_RADIUS)) continue;
    const cls = roadClass(tags.highway);
    roads.push([cls, ...points.flatMap(([x, z]) => [Math.round(x), Math.round(z)])]);
    if (tags.name && cls <= 3) {
      const mid = points[Math.floor(points.length / 2)];
      const length = points.length;
      const existing = labels.get(tags.name);
      if (!existing || existing.length < length) labels.set(tags.name, { length, x: Math.round(mid[0]), z: Math.round(mid[1]) });
    }
    continue;
  }

  if (tags.building && points.length >= 4) {
    const box = orientedBox(points);
    if (!box || Math.hypot(box.x, box.z) > BUILDING_RADIUS || box.w < 2 || box.d < 2) continue;
    const levels = Number(tags["building:levels"]);
    const height = Number.isFinite(levels) && levels > 0 ? levels * 3.2 : 3.5 + hash(el.id) * (box.w * box.d > 400 ? 12 : 5);
    buildings.push([round(box.x), round(box.z), round(box.w), round(box.d), Math.round(box.angle * 1000) / 1000, round(height)]);
  }
}

if (!tabernacle) throw new Error("Faith Tabernacle footprint not found in OSM data");

const output = {
  attribution: "© OpenStreetMap contributors",
  origin: ORIGIN,
  roadClasses: ROAD_CLASSES,
  tabernacle,
  roads,
  buildings,
  labels: [...labels.entries()].map(([name, { x, z }]) => ({ name, x, z })),
};

await mkdir("public/experience", { recursive: true });
await writeFile("public/experience/ota.json", JSON.stringify(output));
console.log(`roads: ${roads.length}, buildings: ${buildings.length}, labels: ${output.labels.length}`);
