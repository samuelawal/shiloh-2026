"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useLayoutEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  InstancedBufferAttribute,
  type InstancedMesh,
  type Material,
  MeshStandardMaterial,
  type Object3D as Object3DType,
  Object3D,
  ShaderMaterial,
  SphereGeometry,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { CORE, WALL_HEIGHT as H, type Wing, WINGS, wingPoint } from "./config";

export type TabernacleState = { roofOpacity: number };

const CREAM = "#efe5d3";
const ROOF_RED = "#b4302a";
const SEAT_RED = "#b3192a";
const MARBLE = "#ece7df";
const OVERHANG = 2.5;
const BALCONY = { y: 9, depth: 9 };

// ---------- Materials -------------------------------------------------------

/** Cream wall with rows of warmly lit windows, computed from world position. */
function windowedWall() {
  const material = new MeshStandardMaterial({ color: CREAM, roughness: 0.85, side: DoubleSide });
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos;")
      .replace("#include <project_vertex>", "#include <project_vertex>\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vWorldPos;
        float winHash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        vec3 wn = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
        if (abs(wn.y) < 0.5) {
          vec2 t = normalize(vec2(-wn.z, wn.x));
          float u = dot(vWorldPos.xz, t) / 4.2;
          float v = (vWorldPos.y - 1.5) / 5.0;
          vec2 cell = floor(vec2(u, v));
          vec2 f = fract(vec2(u, v));
          float pane = step(0.22, f.x) * step(f.x, 0.78) * step(0.2, f.y) * step(f.y, 0.78);
          float rows = step(0.0, v) * step(v, ${((H - 3) / 5).toFixed(2)});
          float lit = step(0.3, winHash(cell)) * pane * rows;
          totalEmissiveRadiance += mix(vec3(1.0, 0.72, 0.4), vec3(1.0, 0.88, 0.7), winHash(cell + 7.0)) * lit * 1.3;
          diffuseColor.rgb *= 1.0 - pane * rows * 0.75;
        }`,
      );
  };
  return material;
}

function useMaterials() {
  return useMemo(() => {
    const roof = new MeshStandardMaterial({ color: ROOF_RED, roughness: 0.7, side: DoubleSide, transparent: true });
    const glass = new ShaderMaterial({
      side: DoubleSide,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          float mullion = step(0.9, fract(vUv.x * 14.0)) + step(0.92, fract(vUv.y * 9.0));
          vec3 glow = mix(vec3(1.0, 0.78, 0.45), vec3(1.0, 0.92, 0.75), vUv.y);
          gl_FragColor = vec4(mix(glow * 1.5, vec3(0.25, 0.2, 0.18), clamp(mullion, 0.0, 1.0)), 1.0);
        }
      `,
    });
    return {
      wall: windowedWall(),
      roof,
      glass,
      trim: new MeshStandardMaterial({ color: "#f7f1e6", roughness: 0.6 }),
      marble: new MeshStandardMaterial({ color: MARBLE, roughness: 0.25, metalness: 0.05 }),
      seat: new MeshStandardMaterial({ color: SEAT_RED, roughness: 0.8 }),
      altar: new MeshStandardMaterial({ color: "#c41a2c", roughness: 0.6 }),
      gold: new MeshStandardMaterial({ color: "#ffd38a", emissive: "#ffb347", emissiveIntensity: 2.2, toneMapped: false }),
    };
  }, []);
}

// ---------- Geometry helpers -----------------------------------------------

function triangles(points: number[]) {
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(points), 3));
  g.computeVertexNormals();
  return g;
}

/** Hipped roof over a wing in local space (x along the wing, z across). */
function wingRoof(length: number, width: number, gable: boolean) {
  const rise = width * 0.3;
  const half = width / 2 + OVERHANG;
  const end = length + OVERHANG;
  const ridgeEnd = gable ? end : length - width / 2;
  const e0 = [0, H, -half], e1 = [end, H, -half], e2 = [end, H, half], e3 = [0, H, half];
  const r0 = [0, H + rise, 0], r1 = [ridgeEnd, H + rise, 0];
  const faces = [e0, e1, r1, e0, r1, r0, e3, r0, r1, e3, r1, e2];
  if (!gable) faces.push(e1, e2, r1);
  return { geometry: triangles(faces.flat()), rise };
}

function gableGlass(length: number, width: number, rise: number) {
  const half = width / 2 + OVERHANG - 1;
  const x = length + 0.4;
  const g = triangles([x, H, -half, x, H, half, x, H + rise - 1.5, 0]);
  g.setAttribute("uv", new BufferAttribute(new Float32Array([0, 0, 1, 0, 0.5, 1]), 2));
  return g;
}

// ---------- Exterior --------------------------------------------------------

function WingShell({ wing, materials, roofRef }: { wing: Wing; materials: ReturnType<typeof useMaterials>; roofRef: (m: Object3DType | null) => void }) {
  const { length: L, width: W, front } = wing;
  const roof = useMemo(() => wingRoof(L, W, !!front), [L, W, front]);
  const glass = useMemo(() => (front ? gableGlass(L, W, roof.rise) : null), [L, W, front, roof.rise]);

  return (
    <group position={[wing.inner[0], 0, wing.inner[1]]} rotation-y={-wing.angle}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[L / 2, H / 2, (side * W) / 2]} material={materials.wall}>
          <planeGeometry args={[L, H]} />
        </mesh>
      ))}
      <mesh position={[L, H / 2, 0]} rotation-y={Math.PI / 2} material={materials.wall}>
        <planeGeometry args={[W, H]} />
      </mesh>
      {/* Cornice band under the eaves */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[L / 2, H - 0.6, (side * (W + 1)) / 2]} material={materials.trim}>
          <boxGeometry args={[L + 1, 1.2, 1]} />
        </mesh>
      ))}
      <mesh position={[L + 0.5, H - 0.6, 0]} material={materials.trim}>
        <boxGeometry args={[1, 1.2, W + 1]} />
      </mesh>
      <mesh ref={roofRef} geometry={roof.geometry} material={materials.roof} />
      {front && glass && (
        <>
          <mesh geometry={glass} material={materials.glass} />
          <mesh position={[L + 7, 4, 0]} material={materials.trim}>
            <boxGeometry args={[12, 0.8, 26]} />
          </mesh>
          <mesh ref={roofRef} position={[L / 2, H + roof.rise + 0.4, 0]} material={materials.trim}>
            <boxGeometry args={[L - 6, 0.8, 3.2]} />
          </mesh>
        </>
      )}
      {/* Stair towers at the outer corners */}
      {[-1, 1].map((side) => (
        <group key={side} position={[L - 3, 0, side * (W / 2 + 1)]}>
          <mesh position={[0, (H + 6) / 2, 0]} material={materials.wall}>
            <cylinderGeometry args={[4.5, 4.5, H + 6, 8]} />
          </mesh>
          <mesh ref={roofRef} position={[0, H + 8, 0]} material={materials.roof}>
            <coneGeometry args={[5.4, 4.5, 8]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Core({ materials, roofRef }: { materials: ReturnType<typeof useMaterials>; roofRef: (m: Object3DType | null) => void }) {
  const pyramid = 40;
  return (
    <group position={[CORE.x, 0, CORE.z]} rotation-y={Math.PI / 8}>
      {/* Clerestory band where the wings meet; the hall below stays open to the wings. */}
      <mesh position={[0, H - 3, 0]} material={materials.wall}>
        <cylinderGeometry args={[CORE.radius - 6, CORE.radius - 6, 6, 8, 1, true]} />
      </mesh>
      <mesh ref={roofRef} position={[0, H + pyramid / 2, 0]} material={materials.roof}>
        <coneGeometry args={[CORE.radius + 4, pyramid, 8, 1, true]} />
      </mesh>
      <mesh ref={roofRef} position={[0, H + pyramid + 9, 0]} material={materials.roof}>
        <coneGeometry args={[2.6, 22, 8]} />
      </mesh>
      <mesh position={[0, H + pyramid + 20.5, 0]} material={materials.gold}>
        <sphereGeometry args={[0.9, 10, 8]} />
      </mesh>
    </group>
  );
}

// ---------- Interior --------------------------------------------------------

type Seat = [number, number, number];

function seatsForWing(wing: Wing, spacing: number): { floor: Seat[]; balcony: Seat[] } {
  const floor: Seat[] = [];
  const balcony: Seat[] = [];
  const half = wing.width / 2;
  for (let along = 8; along < wing.length - 6; along += spacing) {
    for (let across = -half + 3; across <= half - 3; across += spacing * 0.6) {
      if (Math.abs(across) < 1.6 || Math.abs(Math.abs(across) - half / 2) < 0.9) continue;
      if (Math.abs(across) > half - BALCONY.depth - 0.5 && Math.abs(across) < half - 2) {
        const [x, z] = wingPoint(wing, along, across);
        balcony.push([x, BALCONY.y + 0.9 + (half - Math.abs(across)) * 0.35, z]);
      }
      const [x, z] = wingPoint(wing, along, across);
      floor.push([x, along * 0.045, z]);
    }
  }
  return { floor, balcony };
}

function seatsForCore(spacing: number): Seat[] {
  const seats: Seat[] = [];
  for (let r = 17; r < CORE.radius - 9; r += spacing) {
    for (let a = 0; a < Math.PI * 2; a += (spacing * 0.6) / r) {
      if (Math.abs(Math.sin(a * 2)) < 0.04) continue;
      seats.push([CORE.x + Math.cos(a) * r, (r - 17) * 0.06, CORE.z + Math.sin(a) * r]);
    }
  }
  return seats;
}

const CLOTHES = ["#ffffff", "#f3eee4", "#1f3f8f", "#d7261e", "#f4b63f", "#2b2b2b", "#7a1f4d", "#e8d8bd", "#3f8f5a", "#5a3ea8"];

function Crowd({ seats }: { seats: Seat[] }) {
  const people = useRef<InstancedMesh>(null);
  const chairs = useRef<InstancedMesh>(null);

  const personGeometry = useMemo(() => {
    const body = new CylinderGeometry(0.2, 0.27, 1.05, 6);
    body.translate(0, 0.95, 0);
    const head = new SphereGeometry(0.15, 6, 4);
    head.translate(0, 1.62, 0);
    const g = mergeGeometries([body, head])!;
    const colors = new Float32Array(seats.length * 3);
    const phases = new Float32Array(seats.length);
    const c = new Color();
    for (let i = 0; i < seats.length; i++) {
      c.set(CLOTHES[(i * 7 + (i >> 3)) % CLOTHES.length]);
      colors.set([c.r, c.g, c.b], i * 3);
      phases[i] = Math.random() * Math.PI * 2;
    }
    g.setAttribute("aColor", new InstancedBufferAttribute(colors, 3));
    g.setAttribute("aPhase", new InstancedBufferAttribute(phases, 1));
    return g;
  }, [seats]);

  const personMaterial = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          attribute vec3 aColor;
          attribute float aPhase;
          uniform float uTime;
          varying vec3 vColor;
          varying float vLight;
          void main() {
            vec3 p = position;
            float worship = max(0.0, sin(uTime * 0.7 + aPhase * 0.3));
            p.x += sin(uTime * 1.7 + aPhase) * 0.1 * (p.y / 1.7);
            p.y += worship * max(0.0, sin(uTime * 2.4 + aPhase)) * 0.12;
            vec4 world = modelMatrix * instanceMatrix * vec4(p, 1.0);
            float toAltar = length(world.xz - vec2(${CORE.x.toFixed(1)}, ${CORE.z.toFixed(1)}));
            vLight = 0.55 + 0.9 / (1.0 + toAltar / 50.0) + 0.3 * normal.y;
            vColor = aColor;
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vColor;
          varying float vLight;
          void main() { gl_FragColor = vec4(vColor * vec3(1.0, 0.9, 0.78) * vLight * 0.8, 1.0); }
        `,
      }),
    [],
  );

  useLayoutEffect(() => {
    const dummy = new Object3D();
    seats.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      people.current?.setMatrixAt(i, dummy.matrix);
      chairs.current?.setMatrixAt(i, dummy.matrix);
    });
    if (people.current) people.current.instanceMatrix.needsUpdate = true;
    if (chairs.current) chairs.current.instanceMatrix.needsUpdate = true;
  }, [seats]);

  useFrame(({ clock }) => {
    personMaterial.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <>
      <instancedMesh ref={chairs} args={[undefined, undefined, seats.length]} frustumCulled={false}>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color={SEAT_RED} roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={people} args={[personGeometry, personMaterial, seats.length]} frustumCulled={false} />
    </>
  );
}

function Interior({ materials, spacing }: { materials: ReturnType<typeof useMaterials>; spacing: number }) {
  const seats = useMemo(() => {
    const all: Seat[] = [];
    for (const wing of WINGS) {
      const { floor, balcony } = seatsForWing(wing, spacing);
      all.push(...floor, ...balcony);
    }
    all.push(...seatsForCore(spacing));
    // Not every seat is filled — leave a few gaps so the crowd reads naturally.
    return all.filter((_, i) => (i * 2654435761) % 100 > 8);
  }, [spacing]);

  return (
    <group>
      {WINGS.map((wing) => (
        <group key={wing.id} position={[wing.inner[0], 0, wing.inner[1]]} rotation-y={-wing.angle}>
          <mesh position={[wing.length / 2, 0.15, 0]} rotation-x={-Math.PI / 2} material={materials.marble}>
            <planeGeometry args={[wing.length, wing.width]} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[wing.length / 2, BALCONY.y, side * (wing.width / 2 - BALCONY.depth / 2)]}>
              <mesh material={materials.trim}>
                <boxGeometry args={[wing.length - 10, 0.8, BALCONY.depth]} />
              </mesh>
              <mesh position={[0, 0.2, -side * (BALCONY.depth / 2 + 0.1)]} material={materials.gold}>
                <boxGeometry args={[wing.length - 10, 0.18, 0.18]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
      <mesh position={[CORE.x, 0.2, CORE.z]} rotation-x={-Math.PI / 2} material={materials.marble}>
        <circleGeometry args={[CORE.radius - 6, 8]} />
      </mesh>
      <Crowd seats={seats} />
      <Altar materials={materials} />
      <pointLight position={[CORE.x, 18, CORE.z]} intensity={2600} distance={160} decay={1.7} color="#ffd2a0" />
      {WINGS.map((wing) => {
        const [x, z] = wingPoint(wing, wing.length * 0.55);
        return <pointLight key={wing.id} position={[x, 16, z]} intensity={1400} distance={120} decay={1.7} color="#ffe2c0" />;
      })}
    </group>
  );
}

function Altar({ materials }: { materials: ReturnType<typeof useMaterials> }) {
  const tiers = [13, 10.5, 8, 5.5];
  const beams = useRef<Object3DType[]>([]);
  const beam = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        side: DoubleSide,
        vertexShader: /* glsl */ `
          varying float vY;
          void main() { vY = uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying float vY;
          void main() { gl_FragColor = vec4(vec3(1.0, 0.85, 0.62) * 0.2 * pow(vY, 1.4), 1.0); }
        `,
      }),
    [],
  );

  useFrame(({ clock }) => {
    beams.current.forEach((b, i) => {
      if (b) b.rotation.x = Math.sin(clock.elapsedTime * 0.45 + i * 1.6) * 0.3;
    });
  });

  return (
    <group position={[CORE.x, 0, CORE.z]}>
      {tiers.map((r, i) => (
        <group key={r} position={[0, i * 0.9 + 0.45, 0]} rotation-y={Math.PI / 8}>
          <mesh material={materials.altar}>
            <cylinderGeometry args={[r, r + 0.4, 0.9, 8]} />
          </mesh>
          <mesh position={[0, 0.46, 0]} rotation-x={-Math.PI / 2} material={materials.gold}>
            <ringGeometry args={[r - 0.15, r, 8]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, tiers.length * 0.9 + 0.8, 0]} material={materials.trim}>
        <boxGeometry args={[1.6, 1.6, 1]} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <group
            key={i}
            position={[Math.cos(a) * 14, H + 6, Math.sin(a) * 14]}
            rotation-y={-a}
            ref={(el) => {
              if (el) beams.current[i] = el;
            }}
          >
            <mesh material={beam} position={[0, -12, 0]}>
              <coneGeometry args={[7, 24, 20, 1, true]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ---------- Assembly --------------------------------------------------------

export function Tabernacle({ state, crowdSpacing }: { state: RefObject<TabernacleState>; crowdSpacing: number }) {
  const materials = useMaterials();
  const roofs = useRef<Set<Object3DType>>(new Set());
  const roofRef = (m: Object3DType | null) => {
    if (m) roofs.current.add(m);
  };

  useFrame(() => {
    const opacity = state.current.roofOpacity;
    const roof = materials.roof as Material & { opacity: number };
    roof.opacity = opacity;
    roof.depthWrite = opacity > 0.98;
    roofs.current.forEach((m) => (m.visible = opacity > 0.01));
  });

  return (
    <group>
      <hemisphereLight args={["#5a6fb0", "#1a120c", 0.9]} />
      <directionalLight position={[-400, 500, -300]} intensity={0.9} color="#a9bcff" />
      <directionalLight position={[300, 200, 500]} intensity={0.7} color="#ffcc99" />
      {WINGS.map((wing) => {
        const [x, z] = wingPoint(wing, wing.length + 30);
        return <pointLight key={wing.id} position={[x, 14, z]} intensity={650} distance={150} decay={1.8} color="#ffc88a" />;
      })}

      <Interior materials={materials} spacing={crowdSpacing} />
      {WINGS.map((wing) => (
        <WingShell key={wing.id} wing={wing} materials={materials} roofRef={roofRef} />
      ))}
      <Core materials={materials} roofRef={roofRef} />
    </group>
  );
}
