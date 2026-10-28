"use client";

import { Line } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { CylinderGeometry, DoubleSide, LatheGeometry, ShaderMaterial, Vector2, Vector3 } from "three";
import { ARK } from "./config";

// Dimensions are in the bowl's own space (a circle of radius ARK.radius); the
// whole group is stretched east–west into an oval, like Camp Nou.
const R = ARK.radius;
const TOP = ARK.height - 3;
const ARENA = 42;
const SEGMENTS = 160;

/** Cross-section of the three stands, from the arena edge up to the rim. */
const PROFILE: [number, number][] = [
  [ARENA + 1, 0.4],
  [ARENA + 2, 1.2],
  [60, 13],
  [60, 15.5],
  [63, 15.5],
  [78, 28.5],
  [78, 31.5],
  [81, 31.5],
  [R - 4, TOP],
  [R - 0.5, TOP + 0.6],
];

const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  vec3 clothes(float h) {
    if (h < 0.25) return vec3(0.95, 0.94, 0.92);
    if (h < 0.45) return vec3(0.85, 0.08, 0.12);
    if (h < 0.6) return vec3(0.12, 0.1, 0.12);
    if (h < 0.75) return vec3(0.98, 0.78, 0.25);
    if (h < 0.88) return vec3(0.2, 0.3, 0.7);
    return vec3(0.55, 0.15, 0.35);
  }
`;

/** Stands: red-and-white mosaic seating, speckled with a crowd, lit LED fascias. */
function standsMaterial() {
  return new ShaderMaterial({
    side: DoubleSide,
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vObj;
      varying vec3 vWorld;
      void main() {
        vObj = position;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime;
      varying vec3 vObj;
      varying vec3 vWorld;
      void main() {
        vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
        float slope = abs(n.y);
        float r = length(vObj.xz);
        float a = atan(vObj.z, vObj.x);

        // Vertical fascia between tiers: dark with a red LED ribbon.
        if (slope < 0.35) {
          float led = smoothstep(0.55, 0.9, fract(vObj.y / 3.0));
          vec3 c = vec3(0.06, 0.03, 0.04) + vec3(1.0, 0.12, 0.16) * led * 1.6;
          gl_FragColor = vec4(c, 1.0);
          return;
        }
        // Flat walkways.
        if (slope > 0.97) {
          gl_FragColor = vec4(vec3(0.32, 0.29, 0.28), 1.0);
          return;
        }

        // Seat rows and seats.
        float row = floor(vObj.y / 0.85);
        float seat = floor(a * r / 0.6);
        float rowLine = smoothstep(0.82, 1.0, fract(vObj.y / 0.85));

        // Mosaic: Winners red with sweeping white bands across the stands.
        float band = fract(a * 3.0 / 3.14159 + vObj.y * 0.035);
        vec3 mosaic = band < 0.16 ? vec3(0.96, 0.95, 0.93) : (band < 0.22 ? vec3(0.45, 0.04, 0.08) : vec3(0.78, 0.06, 0.1));
        vec3 color = mosaic * (0.75 - rowLine * 0.35);

        // Crowd: most seats filled, gently flickering like a moving congregation.
        float h = hash(vec2(row, seat));
        float filled = step(0.18, h);
        float bob = 0.85 + 0.15 * sin(uTime * 2.0 + h * 40.0);
        vec2 cell = fract(vec2(a * r / 0.6, vObj.y / 0.85));
        float person = smoothstep(0.45, 0.2, length(cell - vec2(0.5, 0.45)));
        color = mix(color, clothes(hash(vec2(seat, row) + 3.7)) * bob, filled * person * 0.9);

        float light = 0.55 + 0.45 * slope;
        gl_FragColor = vec4(color * light, 1.0);
      }
    `,
  });
}

/** The arena floor: a stage at the north end and a crowd on the floor. */
function arenaMaterial() {
  return new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vXZ;
      void main() {
        vXZ = position.xy;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE_GLSL}
      uniform float uTime;
      varying vec2 vXZ;
      void main() {
        vec2 p = vXZ;
        float r = length(p);
        vec3 floorColor = vec3(0.86, 0.83, 0.8) * 0.55;
        float ring = smoothstep(0.6, 0.0, abs(r - 14.0)) + smoothstep(0.4, 0.0, abs(r - 38.0));
        floorColor = mix(floorColor, vec3(0.9, 0.08, 0.12), clamp(ring, 0.0, 1.0));
        // Floor seating fills the arena outside the central circle.
        vec2 cell = floor(p / vec2(0.6, 0.9));
        vec2 f = fract(p / vec2(0.6, 0.9));
        float h = hash(cell);
        float seated = step(16.0, r) * step(r, 37.0) * step(0.15, h) * step(p.y, 24.0);
        float person = smoothstep(0.45, 0.2, length(f - 0.5));
        float bob = 0.85 + 0.15 * sin(uTime * 2.2 + h * 30.0);
        vec3 color = mix(floorColor, clothes(hash(cell + 9.1)) * bob, seated * person);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
}

/** The glowing core behind the façade ribbons. */
function glowMaterial() {
  return new ShaderMaterial({
    side: DoubleSide,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        float column = smoothstep(0.0, 0.15, fract(vUv.x * 64.0)) * smoothstep(1.0, 0.85, fract(vUv.x * 64.0));
        vec3 c = mix(vec3(0.035, 0.008, 0.014), vec3(0.72, 0.03, 0.07), column * (0.2 + 0.55 * vUv.y));
        gl_FragColor = vec4(c, 1.0);
      }
    `,
  });
}

/** A wavy white façade ribbon wrapping the bowl. */
function ribbon(index: number) {
  const radius = R + 1.5 + (index % 2) * 0.8;
  const g = new CylinderGeometry(radius, radius, 3.4, SEGMENTS, 1, true);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const a = Math.atan2(pos.getZ(i), pos.getX(i));
    pos.setY(i, pos.getY(i) + Math.sin(a * 4 + index * 0.9) * 2.2);
  }
  g.computeVertexNormals();
  return g;
}

const ellipse = (radius: number, y: number) =>
  Array.from({ length: SEGMENTS + 1 }, (_, i) => {
    const a = (i / SEGMENTS) * Math.PI * 2;
    return new Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius);
  });

export function Ark() {
  const stands = useMemo(() => new LatheGeometry(PROFILE.map(([r, y]) => new Vector2(r, y)), SEGMENTS), []);
  const standsMat = useMemo(standsMaterial, []);
  const arenaMat = useMemo(arenaMaterial, []);
  const glowMat = useMemo(glowMaterial, []);
  const ribbons = useMemo(() => Array.from({ length: 7 }, (_, i) => ribbon(i)), []);
  const innerRing = useMemo(() => ellipse(R - 16, TOP + 4.4), []);
  const outerRing = useMemo(() => ellipse(R + 9, TOP + 5.6), []);

  useFrame(({ clock }) => {
    standsMat.uniforms.uTime.value = clock.elapsedTime;
    arenaMat.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <group position={[ARK.x, 0, ARK.z]} scale={[ARK.stretch, 1, 1]}>
      <mesh geometry={stands} material={standsMat} />

      <mesh position={[0, 0.35, 0]} rotation-x={-Math.PI / 2} material={arenaMat}>
        <circleGeometry args={[ARENA + 1.5, 96]} />
      </mesh>

      {/* Stage and screen at the north end of the arena */}
      <mesh position={[0, 1.6, -33]}>
        <boxGeometry args={[34, 3.2, 9]} />
        <meshStandardMaterial color="#8f0d17" roughness={0.6} />
      </mesh>
      <mesh position={[0, 11, -38]}>
        <planeGeometry args={[30, 12]} />
        <meshBasicMaterial color="#ff5a52" toneMapped={false} />
      </mesh>

      {/* Façade: a red-lit core wrapped in flowing white ribbons */}
      <mesh position={[0, TOP / 2, 0]} material={glowMat}>
        <cylinderGeometry args={[R, R, TOP, SEGMENTS, 1, true]} />
      </mesh>
      {ribbons.map((geometry, i) => (
        <mesh key={i} geometry={geometry} position={[0, 4 + i * 6.6, 0]}>
          <meshStandardMaterial color="#f4f1ee" emissive="#fff4f0" emissiveIntensity={0.35} roughness={0.45} side={DoubleSide} />
        </mesh>
      ))}

      {/* Roof canopy with LED rings and floodlights */}
      <mesh position={[0, TOP + 5, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[R - 16, R + 9, SEGMENTS, 1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={0.88} side={DoubleSide} />
      </mesh>
      <Line points={innerRing} color="#ff2d3a" lineWidth={3} />
      <Line points={outerRing} color="#ffffff" lineWidth={1.5} transparent opacity={0.8} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * (R - 14), TOP + 3.6, Math.sin(a) * (R - 14)]} rotation-y={-a}>
            <boxGeometry args={[1.2, 1.4, 5]} />
            <meshBasicMaterial color="#fff6ee" toneMapped={false} />
          </mesh>
        );
      })}
      <pointLight position={[0, TOP, 0]} intensity={2500} distance={160} decay={1.6} color="#ffe8e0" />
    </group>
  );
}
