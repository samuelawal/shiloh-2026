"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh, Object3D } from "three";
import { BOOKSHOP, BUS_PARK, HELP_DESK, type Vec3 } from "./config";
import { useSignTexture } from "./Entrances";

/** A sign board on two posts, facing +z. */
function Sign({ text, position, width = 14, rotation = 0 }: { text: string; position: Vec3; width?: number; rotation?: number }) {
  const texture = useSignTexture(text);
  return (
    <group position={position} rotation-y={rotation}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * width) / 2.4, 2.5, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 5, 6]} />
          <meshStandardMaterial color="#3a2a2a" />
        </mesh>
      ))}
      <mesh position={[0, 5.4, 0]}>
        <planeGeometry args={[width, width / 8]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={2} />
      </mesh>
    </group>
  );
}

// ---------- Shuttles: bus park inside the gate -----------------------------

const BUS_ROWS = 3;
const BUS_COLUMNS = 7;

function BusPark() {
  const bodies = useRef<InstancedMesh>(null);
  const windows = useRef<InstancedMesh>(null);
  const buses = useMemo(() => {
    const list: [number, number][] = [];
    for (let row = 0; row < BUS_ROWS; row++) {
      for (let col = 0; col < BUS_COLUMNS; col++) {
        if ((row * 5 + col) % 6 === 4) continue;
        list.push([BUS_PARK[0] + (col - (BUS_COLUMNS - 1) / 2) * 7, BUS_PARK[2] + (row - 1) * 18]);
      }
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    const dummy = new Object3D();
    const color = new Color();
    buses.forEach(([x, z], i) => {
      dummy.position.set(x, 1.7, z);
      dummy.updateMatrix();
      bodies.current?.setMatrixAt(i, dummy.matrix);
      bodies.current?.setColorAt(i, color.set(i % 3 === 0 ? "#f3efea" : "#c4101b"));
      dummy.position.set(x, 2.3, z);
      dummy.updateMatrix();
      windows.current?.setMatrixAt(i, dummy.matrix);
    });
    for (const mesh of [bodies.current, windows.current]) {
      if (!mesh) continue;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }
  }, [buses]);

  return (
    <group>
      <mesh position={[BUS_PARK[0], 0.2, BUS_PARK[2]]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[62, 60]} />
        <meshStandardMaterial color="#3c3436" roughness={0.9} />
      </mesh>
      {[-1, 0, 1].map((row) => (
        <mesh key={row} position={[BUS_PARK[0], 0.25, BUS_PARK[2] + row * 18 + 7.5]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[52, 0.4]} />
          <meshBasicMaterial color="#f5f0e8" />
        </mesh>
      ))}
      <instancedMesh ref={bodies} args={[undefined, undefined, buses.length]}>
        <boxGeometry args={[2.8, 3, 12]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={windows} args={[undefined, undefined, buses.length]}>
        <boxGeometry args={[2.9, 0.9, 10.5]} />
        <meshBasicMaterial color="#ffe1cf" toneMapped={false} />
      </instancedMesh>
      <Sign text="Shuttle Bus Park" position={[BUS_PARK[0], 0, BUS_PARK[2] + 33]} width={20} />
    </group>
  );
}

// ---------- Help desk: welcome kiosk near the front plaza ------------------

function HelpDesk() {
  const [x, , z] = HELP_DESK;
  return (
    <group position={[x, 0, z]} rotation-y={-0.4}>
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[12, 1.2, 3]} />
        <meshStandardMaterial color="#c4101b" roughness={0.5} />
      </mesh>
      {[-5.5, 5.5].map((px) => (
        <mesh key={px} position={[px, 2.6, -1]}>
          <cylinderGeometry args={[0.18, 0.18, 4, 6]} />
          <meshStandardMaterial color="#f3efea" />
        </mesh>
      ))}
      <mesh position={[0, 4.8, -0.5]}>
        <boxGeometry args={[14, 0.5, 6]} />
        <meshStandardMaterial color="#f3efea" roughness={0.4} />
      </mesh>
      <mesh position={[0, 3, -1.4]}>
        <planeGeometry args={[10, 1.4]} />
        <meshBasicMaterial color="#ffd9cf" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 4, 4]} intensity={160} distance={30} decay={1.6} color="#ffe6e0" />
      <Sign text="Welcome & Help Desk" position={[0, 0, 6]} width={18} />
    </group>
  );
}

// ---------- Bookshop: beside the Grace Entrance ----------------------------

function Bookshop() {
  const [x, , z] = BOOKSHOP;
  return (
    <group position={[x, 0, z]} rotation-y={-0.9}>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[18, 7, 10]} />
        <meshStandardMaterial color="#efe5d3" roughness={0.8} />
      </mesh>
      <mesh position={[0, 7.4, 0]}>
        <boxGeometry args={[19, 0.8, 11]} />
        <meshStandardMaterial color="#b4302a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.6, 5.05]}>
        <planeGeometry args={[14, 4]} />
        <meshBasicMaterial color="#ffe0c8" toneMapped={false} />
      </mesh>
      <Sign text="Bookshop" position={[0, 0, 8]} width={12} />
    </group>
  );
}

export function Services() {
  return (
    <group>
      <BusPark />
      <HelpDesk />
      <Bookshop />
    </group>
  );
}
