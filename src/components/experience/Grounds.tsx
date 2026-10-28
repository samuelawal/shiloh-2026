"use client";

import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { Vector3 } from "three";
import { GATE, WINGS, wingPoint } from "./config";

const front = WINGS.find((w) => w.front)!;
const [plazaX, plazaZ] = wingPoint(front, front.length + 30);

// Processional route from the Canaanland gate, around The Ark, to the front plaza.
const AVENUE = [
  [GATE[0], GATE[2] + 12],
  [170, -500],
  [200, -230],
  [190, 10],
  [130, 120],
  [plazaX, plazaZ],
].map(([x, z]) => new Vector3(x, 0.6, z));

function Gate() {
  return (
    <group position={GATE}>
      {[-16, 16].map((x) => (
        <mesh key={x} position={[x, 9, 0]}>
          <boxGeometry args={[3.2, 18, 3.2]} />
          <meshStandardMaterial color="#efe5d3" roughness={0.8} />
        </mesh>
      ))}
      <mesh position={[0, 19.5, 0]}>
        <boxGeometry args={[38, 3.4, 3.6]} />
        <meshStandardMaterial color="#b4302a" roughness={0.7} />
      </mesh>
      {[1.85, -1.85].map((z) => (
        <mesh key={z} position={[0, 19.5, z]} rotation-y={z > 0 ? 0 : Math.PI}>
          <planeGeometry args={[30, 1.4]} />
          <meshBasicMaterial color="#ff4a45" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function Avenue() {
  const lamps = useMemo(() => {
    const list: Vector3[] = [];
    for (let i = 0; i < AVENUE.length - 1; i++) {
      const a = AVENUE[i];
      const b = AVENUE[i + 1];
      const direction = b.clone().sub(a);
      const length = direction.length();
      const side = new Vector3(-direction.z, 0, direction.x).normalize().multiplyScalar(10);
      for (let d = 0; d < length; d += 28) {
        const p = a.clone().addScaledVector(direction, d / length).setY(0);
        list.push(p.clone().add(side), p.clone().sub(side));
      }
    }
    return list;
  }, []);

  return (
    <group>
      <Line points={AVENUE} color="#ff5a4f" lineWidth={6} transparent opacity={0.55} />
      {lamps.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 3.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 7, 4]} />
            <meshBasicMaterial color="#2a2018" />
          </mesh>
          <mesh position={[0, 7.3, 0]}>
            <sphereGeometry args={[0.9, 8, 6]} />
            <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Plaza() {
  return (
    <mesh position={[plazaX, 0.25, plazaZ]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[34, 48]} />
      <meshStandardMaterial color="#5e574e" roughness={0.6} />
    </mesh>
  );
}

export function Grounds() {
  return (
    <group>
      <Gate />
      <Avenue />
      <Plaza />
    </group>
  );
}
