"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, CylinderGeometry, DoubleSide, SRGBColorSpace } from "three";
import { type Entrance, ENTRANCES, WINGS, wingPoint } from "./config";

const PORCH = { width: 24, depth: 9, height: 10.5 };

/** A red name board drawn to a canvas, using the site's display font once it has loaded. */
export function useSignTexture(text: string) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 128;
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext("2d");
      if (!ctx || cancelled) return;
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-fraunces").trim() || "Georgia, serif";
      ctx.fillStyle = "#c4101b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#ffd6d2";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
      ctx.fillStyle = "#ffffff";
      ctx.font = `700 64px ${family}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.letterSpacing = "6px";
      ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2 + 4);
      texture.needsUpdate = true;
    };
    draw();
    void document.fonts.ready.then(draw);
    return () => {
      cancelled = true;
    };
  }, [text, texture]);

  return texture;
}

// Triangular prism for the pediment, apex up, running across the porch.
const pediment = (() => {
  const g = new CylinderGeometry(5.2, 5.2, PORCH.width + 1, 3);
  g.rotateX(-Math.PI / 2);
  g.scale(1, 0.55, 1);
  return g;
})();

/** Portico built in local space facing +x, with the wall at x = 0. */
function Porch({ entrance }: { entrance: Entrance }) {
  const sign = useSignTexture(entrance.name);
  const { width: W, depth: D, height: Hp } = PORCH;

  const placement = useMemo(() => {
    const wing = WINGS.find((w) => w.id === entrance.wing)!;
    if (entrance.side === "end") {
      const [x, z] = wingPoint(wing, wing.length);
      return { x, z, rotation: -wing.angle };
    }
    const [x, z] = wingPoint(wing, entrance.along ?? wing.length / 2, entrance.side * (wing.width / 2));
    return { x, z, rotation: -wing.angle - (entrance.side * Math.PI) / 2 };
  }, [entrance]);

  return (
    <group position={[placement.x, 0, placement.z]} rotation-y={placement.rotation}>
      {/* Glowing doors */}
      <mesh position={[0.35, 4.5, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[W - 6, 8]} />
        <meshBasicMaterial color="#ffd9c4" toneMapped={false} side={DoubleSide} />
      </mesh>
      {/* Steps */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[D + 1.5 - i * 1.4, 0.3 + i * 0.5, 0]}>
          <boxGeometry args={[3 + i * 0.1, 0.5, W + 4 - i * 2]} />
          <meshStandardMaterial color="#e9dfd2" roughness={0.6} />
        </mesh>
      ))}
      {/* Red carpet leading out */}
      <mesh position={[D + 18, 0.35, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[30, 7]} />
        <meshStandardMaterial color="#b0101a" roughness={0.8} />
      </mesh>
      {/* Columns */}
      {[-1.5, -0.5, 0.5, 1.5].map((k) => (
        <mesh key={k} position={[D - 1, Hp / 2, (k * (W - 4)) / 3]}>
          <cylinderGeometry args={[0.75, 0.85, Hp, 12]} />
          <meshStandardMaterial color="#f7efe4" roughness={0.5} />
        </mesh>
      ))}
      {/* Canopy, pediment and name board */}
      <mesh position={[D / 2, Hp + 0.5, 0]}>
        <boxGeometry args={[D + 1, 1, W + 1]} />
        <meshStandardMaterial color="#f7efe4" roughness={0.5} />
      </mesh>
      <mesh geometry={pediment} position={[D / 2, Hp + 2.4, 0]}>
        <meshStandardMaterial color="#b4302a" roughness={0.65} />
      </mesh>
      <mesh position={[D + 0.56, Hp + 0.5, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[W - 2, 1.9]} />
        <meshBasicMaterial map={sign} toneMapped={false} />
      </mesh>
      {/* Warm downlight onto the steps */}
      <pointLight position={[D + 3, Hp - 1, 0]} intensity={150} distance={30} decay={1.6} color="#ffd2c0" />
    </group>
  );
}

export function Entrances() {
  return (
    <group>
      {ENTRANCES.map((entrance) => (
        <Porch key={entrance.name} entrance={entrance} />
      ))}
    </group>
  );
}
