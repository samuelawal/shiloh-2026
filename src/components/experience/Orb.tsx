"use client";

import { useFrame } from "@react-three/fiber";
import { type RefObject, useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, type Group, type Points, ShaderMaterial, Vector3 } from "three";

const TRAIL = 90;

export type OrbState = { position: Vector3; visible: boolean };

/** The travelling light: a hot core, a soft halo and a sparkling trail. */
export function Orb({ state }: { state: RefObject<OrbState> }) {
  const group = useRef<Group>(null);
  const trail = useRef<Points>(null);
  const history = useMemo(() => Array.from({ length: TRAIL }, () => new Vector3()), []);
  const seeded = useRef(false);

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(TRAIL * 3), 3));
    const age = new Float32Array(TRAIL);
    for (let i = 0; i < TRAIL; i++) age[i] = i / (TRAIL - 1);
    g.setAttribute("aAge", new BufferAttribute(age, 1));
    return g;
  }, []);

  const trailMaterial = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        vertexShader: /* glsl */ `
          attribute float aAge;
          varying float vAge;
          void main() {
            vAge = aAge;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = (1.0 - aAge) * 2600.0 / -mv.z + 1.5;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vAge;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d) * pow(1.0 - vAge, 1.6);
            gl_FragColor = vec4(vec3(1.0, 0.32, 0.3) * a * 1.8, a);
          }
        `,
      }),
    [],
  );

  const halo = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float a = exp(-d * 4.0);
            gl_FragColor = vec4(vec3(1.0, 0.38, 0.34) * a * 1.6, a);
          }
        `,
      }),
    [],
  );

  useFrame(({ camera }) => {
    const { position, visible } = state.current;
    if (!group.current || !trail.current) return;
    group.current.visible = visible;
    trail.current.visible = visible;
    if (!visible) {
      seeded.current = false;
      return;
    }
    if (!seeded.current) {
      history.forEach((p) => p.copy(position));
      seeded.current = true;
    }
    group.current.position.copy(position);
    group.current.quaternion.copy(camera.quaternion);
    for (let i = TRAIL - 1; i > 0; i--) history[i].copy(history[i - 1]);
    history[0].copy(position);
    const attr = geometry.attributes.position as BufferAttribute;
    history.forEach((p, i) => attr.setXYZ(i, p.x + (Math.random() - 0.5) * i * 0.04, p.y + (Math.random() - 0.5) * i * 0.04, p.z));
    attr.needsUpdate = true;
  });

  return (
    <>
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[2.4, 16, 12]} />
          <meshBasicMaterial color="#fff0ee" toneMapped={false} />
        </mesh>
        <mesh material={halo}>
          <planeGeometry args={[44, 44]} />
        </mesh>
      </group>
      <points ref={trail} geometry={geometry} material={trailMaterial} frustumCulled={false} />
    </>
  );
}
