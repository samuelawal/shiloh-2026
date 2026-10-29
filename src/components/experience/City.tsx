"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  InstancedBufferAttribute,
  type InstancedMesh,
  Matrix4,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { CLEARINGS, type MapData } from "./config";

export const FOG = { color: new Color("#1c0e06"), near: 900, far: 3800 };

const FOG_GLSL = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  vec3 applyFog(vec3 color, float dist) {
    return mix(color, uFogColor, smoothstep(uFogNear, uFogFar, dist));
  }
`;

const fogUniforms = () => ({
  uFogColor: { value: FOG.color },
  uFogNear: { value: FOG.near },
  uFogFar: { value: FOG.far },
});

// ---------- Buildings -------------------------------------------------------

const buildingMaterial = () =>
  new ShaderMaterial({
    uniforms: { ...fogUniforms(), uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying float vSeed;
      varying float vDist;
      void main() {
        vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        vSeed = aSeed;
        vec4 mv = viewMatrix * world;
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      uniform float uTime;
      varying vec3 vWorld;
      varying vec3 vNormal;
      varying float vSeed;
      varying float vDist;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 base = vec3(0.03, 0.018, 0.024);
        if (vNormal.y > 0.5) {
          gl_FragColor = vec4(applyFog(base * 1.4, vDist), 1.0);
          return;
        }
        vec3 tangent = normalize(cross(vec3(0.0, 1.0, 0.0), vNormal));
        float u = dot(vWorld.xz, tangent.xz) / 3.2;
        float v = (vWorld.y - 0.6) / 3.2;
        vec2 cell = floor(vec2(u, v));
        vec2 f = fract(vec2(u, v));
        float pane = step(0.3, f.x) * step(f.x, 0.7) * step(0.35, f.y) * step(f.y, 0.75);
        float h = hash(cell + vSeed * 17.0);
        float lit = step(0.7, h) * pane * step(0.0, vWorld.y - 0.6);
        float flicker = 0.85 + 0.15 * sin(uTime * (0.5 + h * 2.0) + h * 40.0);
        vec3 warm = mix(vec3(1.0, 0.62, 0.28), vec3(1.0, 0.86, 0.6), hash(cell + 3.1));
        float shade = 0.6 + 0.4 * abs(vNormal.x);
        vec3 color = base * shade + warm * lit * flicker * 1.6;
        gl_FragColor = vec4(applyFog(color, vDist), 1.0);
      }
    `,
  });

function Buildings({ data }: { data: number[][] }) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    const g = new BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    const seeds = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) seeds[i] = ((i * 0.618) % 1) * 10;
    g.setAttribute("aSeed", new InstancedBufferAttribute(seeds, 1));
    return g;
  }, [data]);
  const material = useMemo(buildingMaterial, []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new Matrix4();
    const q = new Quaternion();
    const up = new Vector3(0, 1, 0);
    const pos = new Vector3();
    const scale = new Vector3();
    data.forEach(([x, z, w, d, angle, h], i) => {
      q.setFromAxisAngle(up, -angle);
      matrix.compose(pos.set(x, 0, z), q, scale.set(w, h, d));
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [data]);

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });

  return <instancedMesh ref={ref} args={[geometry, material, data.length]} frustumCulled={false} />;
}

// ---------- Roads -----------------------------------------------------------

const ROAD_WIDTH = [16, 13, 11, 9, 5.5, 3.5];
const ROAD_GLOW = [1.05, 1.0, 0.95, 0.9, 0.55, 0.35];

function buildRoads(roads: number[][]) {
  const positions: number[] = [];
  const glow: number[] = [];
  const along: number[] = [];
  const traffic: number[] = [];
  const side: number[] = [];
  const indices: number[] = [];

  for (const road of roads) {
    const cls = road[0];
    const width = ROAD_WIDTH[cls] / 2;
    let distance = 0;
    for (let i = 1; i + 3 < road.length; i += 2) {
      const ax = road[i], az = road[i + 1], bx = road[i + 2], bz = road[i + 3];
      const dx = bx - ax, dz = bz - az;
      const len = Math.hypot(dx, dz);
      if (len < 0.01) continue;
      const ux = dx / len, uz = dz / len;
      const nx = -uz * width, nz = ux * width;
      // Extend each quad by half a width so consecutive segments overlap at bends.
      const sx = ax - ux * width, sz = az - uz * width;
      const ex = bx + ux * width, ez = bz + uz * width;
      const base = positions.length / 3;
      positions.push(sx + nx, 0.3, sz + nz, sx - nx, 0.3, sz - nz, ex + nx, 0.3, ez + nz, ex - nx, 0.3, ez - nz);
      for (let k = 0; k < 4; k++) {
        glow.push(ROAD_GLOW[cls]);
        traffic.push(cls <= 3 ? 1 : 0);
      }
      along.push(distance, distance, distance + len, distance + len);
      side.push(0, 1, 0, 1);
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      distance += len;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  geometry.setAttribute("aGlow", new BufferAttribute(new Float32Array(glow), 1));
  geometry.setAttribute("aAlong", new BufferAttribute(new Float32Array(along), 1));
  geometry.setAttribute("aTraffic", new BufferAttribute(new Float32Array(traffic), 1));
  geometry.setAttribute("aSide", new BufferAttribute(new Float32Array(side), 1));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

const roadMaterial = () =>
  new ShaderMaterial({
    uniforms: { ...fogUniforms(), uTime: { value: 0 } },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      attribute float aGlow;
      attribute float aAlong;
      attribute float aTraffic;
      attribute float aSide;
      varying float vGlow;
      varying float vAlong;
      varying float vTraffic;
      varying float vDist;
      varying float vCenter;
      void main() {
        vGlow = aGlow;
        vAlong = aAlong;
        vTraffic = aTraffic;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDist = -mv.z;
        vCenter = aSide;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      ${FOG_GLSL}
      uniform float uTime;
      varying float vGlow;
      varying float vAlong;
      varying float vTraffic;
      varying float vDist;
      varying float vCenter;
      void main() {
        float edge = 1.0 - pow(abs(vCenter * 2.0 - 1.0), 2.0);
        vec3 glowColor = vec3(1.0, 0.55, 0.2);
        vec3 color = glowColor * vGlow * (0.45 + 0.55 * edge);
        float cars = vTraffic * smoothstep(0.92, 1.0, fract(vAlong / 90.0 - uTime * 0.35));
        cars += vTraffic * smoothstep(0.95, 1.0, fract(vAlong / 140.0 + uTime * 0.22)) * 0.8;
        color += vec3(1.0, 0.92, 0.75) * cars * 2.2;
        float alpha = 0.55 + 0.45 * edge;
        gl_FragColor = vec4(applyFog(color, vDist * 0.9), alpha * (1.0 - smoothstep(uFogNear, uFogFar, vDist)));
      }
    `,
  });

function Roads({ data }: { data: number[][] }) {
  const geometry = useMemo(() => buildRoads(data), [data]);
  const material = useMemo(roadMaterial, []);
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime;
  });
  return <mesh geometry={geometry} material={material} renderOrder={1} />;
}

// ---------- Ground & sky ----------------------------------------------------

function Ground() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: fogUniforms(),
        vertexShader: /* glsl */ `
          varying vec2 vXZ;
          varying float vDist;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            vXZ = world.xz;
            vec4 mv = viewMatrix * world;
            vDist = -mv.z;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          ${FOG_GLSL}
          varying vec2 vXZ;
          varying float vDist;
          void main() {
            float glow = exp(-length(vXZ) / 420.0);
            vec3 color = vec3(0.014, 0.008, 0.005) + vec3(0.07, 0.03, 0.01) * glow;
            gl_FragColor = vec4(applyFog(color, vDist), 1.0);
          }
        `,
      }),
    [],
  );
  return (
    <mesh rotation-x={-Math.PI / 2} material={material}>
      <planeGeometry args={[12000, 12000]} />
    </mesh>
  );
}

function Sky() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        side: 1,
        depthWrite: false,
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
          void main() {
            float h = vDir.y;
            // Golden-hour sky from the Shiloh 2026 flyer: amber horizon, low sun, umber above.
            vec3 horizon = vec3(0.95, 0.5, 0.16);
            vec3 band = vec3(0.4, 0.15, 0.05);
            vec3 zenith = vec3(0.05, 0.025, 0.016);
            vec3 color = mix(horizon, band, smoothstep(0.0, 0.14, h));
            color = mix(color, zenith, smoothstep(0.14, 0.6, h));
            vec3 sunDir = normalize(vec3(0.75, 0.04, -0.66));
            float sun = max(dot(vDir, sunDir), 0.0);
            color += vec3(1.0, 0.72, 0.36) * (pow(sun, 18.0) * 0.9 + pow(sun, 400.0) * 1.6);
            color = mix(vec3(0.1, 0.045, 0.02), color, smoothstep(-0.05, 0.0, h));
            vec3 cell = floor(vDir * 420.0);
            float star = step(0.9975, hash(cell)) * smoothstep(0.08, 0.4, h);
            color += vec3(1.0, 0.95, 0.85) * star * 0.8;
            gl_FragColor = vec4(color, 1.0);
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[8000, 32, 16]} />
    </mesh>
  );
}

export function City({ map }: { map: MapData }) {
  const buildings = useMemo(
    () => map.buildings.filter(([x, z]) => !CLEARINGS.some((c) => Math.hypot(x - c.x, z - c.z) < c.r)),
    [map.buildings],
  );
  return (
    <group>
      <Sky />
      <Ground />
      <Roads data={map.roads} />
      <Buildings data={buildings} />
    </group>
  );
}
