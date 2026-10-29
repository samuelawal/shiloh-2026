"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { type RefObject, useEffect, useRef } from "react";
import { MathUtils, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Ark } from "./Ark";
import { City, FOG } from "./City";
import { ALL_PLACES, type MapData, OVERVIEW, type Place, type PlaceId, PLACES, SERVICE_IDS, SERVICE_PLACES, type Vec3 } from "./config";
import { Entrances } from "./Entrances";
import { Grounds } from "./Grounds";
import { Orb, type OrbState } from "./Orb";
import { Services } from "./Services";
import { Tabernacle, type TabernacleState } from "./Tabernacle";
import { type Cue, cameraAt, cueAt, INTRO_DURATION, orbAt, roofOpacityAt } from "./timeline";

export type Phase = "gate" | "intro" | "explore";

export type SceneProps = {
  map: MapData;
  phase: Phase;
  introStartedAt: RefObject<number>;
  activePlace: PlaceId | null;
  lowPower: boolean;
  onCue: (cue: Cue | null, time: number) => void;
  onIntroEnd: () => void;
  onSelectPlace: (id: PlaceId) => void;
};

const FLIGHT_SECONDS = 1.9;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

type Flight = { from: [Vector3, Vector3]; to: [Vector3, Vector3]; start: number };

function Director({
  phase,
  introStartedAt,
  activePlace,
  onCue,
  onIntroEnd,
  tabernacle,
  orb,
}: Pick<SceneProps, "phase" | "introStartedAt" | "activePlace" | "onCue" | "onIntroEnd"> & {
  tabernacle: RefObject<TabernacleState>;
  orb: RefObject<OrbState>;
}) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const target = useRef(new Vector3(...OVERVIEW.target));
  const flight = useRef<Flight | null>(null);
  const lastCue = useRef<Cue | null>(null);
  const ended = useRef(false);

  // Start a camera flight whenever the selected place changes in explore mode.
  useEffect(() => {
    if (phase !== "explore") return;
    const view = activePlace ? ALL_PLACES.find((p) => p.id === activePlace)!.camera : OVERVIEW;
    const currentTarget = controls ? controls.target.clone() : target.current.clone();
    flight.current = {
      from: [camera.position.clone(), currentTarget],
      to: [new Vector3(...view.position), new Vector3(...view.target)],
      start: performance.now(),
    };
  }, [activePlace, phase, camera, controls]);

  useEffect(() => {
    if (phase === "intro") ended.current = false;
  }, [phase]);

  useFrame(({ clock }) => {
    const now = performance.now();

    if (phase === "gate") {
      const t = clock.elapsedTime * 0.04;
      cameraAt(0, camera.position, target.current);
      camera.position.x += Math.sin(t) * 120;
      camera.position.z += Math.cos(t) * 80;
      camera.lookAt(target.current);
      orb.current.visible = false;
      tabernacle.current.roofOpacity = 1;
      return;
    }

    if (phase === "intro") {
      const t = (now - introStartedAt.current) / 1000;
      cameraAt(t, camera.position, target.current);
      camera.lookAt(target.current);
      const progress = orbAt(t, orb.current.position);
      orb.current.visible = progress > 0 && progress < 1;
      tabernacle.current.roofOpacity = roofOpacityAt(t);
      const cue = cueAt(t);
      if (cue !== lastCue.current) {
        lastCue.current = cue;
        onCue(cue, t);
      }
      if (t >= INTRO_DURATION && !ended.current) {
        ended.current = true;
        onIntroEnd();
      }
      return;
    }

    orb.current.visible = false;
    const roofGoal = activePlace === "ministers" ? 0 : 1;
    tabernacle.current.roofOpacity = MathUtils.lerp(tabernacle.current.roofOpacity, roofGoal, 0.06);

    const f = flight.current;
    if (f && controls) {
      const u = Math.min(1, (now - f.start) / (FLIGHT_SECONDS * 1000));
      const k = easeInOut(u);
      camera.position.lerpVectors(f.from[0], f.to[0], k);
      // Arc upward mid-flight so long hops read as a fly-over.
      camera.position.y += Math.sin(k * Math.PI) * f.from[0].distanceTo(f.to[0]) * 0.18;
      controls.target.lerpVectors(f.from[1], f.to[1], k);
      controls.enabled = u >= 1;
      if (u >= 1) flight.current = null;
      controls.update();
    }
  });

  return null;
}

function Hotspot({ place, active, hint, onSelect }: { place: Place; active: boolean; hint: boolean; onSelect: () => void }) {
  return (
    <Html position={place.anchor as Vec3} center zIndexRange={[20, 0]}>
      <button
        type="button"
        onClick={onSelect}
        aria-label={place.label}
        className={`group flex items-center gap-2 rounded-full border p-2 text-sm font-semibold whitespace-nowrap backdrop-blur-md transition sm:px-3 sm:py-1.5 ${
          active
            ? "border-accent/80 bg-flame/90 text-white shadow-[0_0_30px_rgba(215,20,30,0.7)]"
            : "border-white/15 bg-black/45 text-white hover:border-accent/60 hover:text-white"
        }`}
      >
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
        </span>
        {/* On phones only the active place shows its name; the menu below names the rest. */}
        <span className={active ? "pr-1" : "hidden sm:inline [@media(max-height:500px)]:hidden"}>{place.label}</span>
        {hint && !active && <span className="hidden rounded-full bg-flame px-2 py-0.5 text-xs text-white sm:inline [@media(max-height:500px)]:hidden">Click to open →</span>}
      </button>
    </Html>
  );
}

export function Scene(props: SceneProps) {
  const { map, phase, activePlace, lowPower, onSelectPlace } = props;
  const tabernacle = useRef<TabernacleState>({ roofOpacity: 1 });
  const orb = useRef<OrbState>({ position: new Vector3(), visible: false });

  return (
    <Canvas
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      camera={{ fov: 42, near: 2, far: 12000, position: [1900, 700, -1500] }}
      gl={{ antialias: !lowPower, powerPreference: "high-performance" }}
      onCreated={({ scene }) => {
        scene.background = FOG.color;
      }}
    >
      <City map={map} />
      <Grounds />
      <Ark />
      <Entrances />
      <Services />
      <Tabernacle state={tabernacle} crowdSpacing={lowPower ? 2.6 : 1.55} />
      <Orb state={orb} />

      <OrbitControls
        makeDefault
        enabled={phase === "explore"}
        enableDamping
        dampingFactor={0.08}
        minDistance={60}
        maxDistance={1800}
        maxPolarAngle={1.38}
        target={OVERVIEW.target}
      />
      <Director {...props} tabernacle={tabernacle} orb={orb} />

      {phase === "explore" &&
        [...PLACES, ...(activePlace && SERVICE_IDS.has(activePlace) ? SERVICE_PLACES : [])].map((place) => (
          <Hotspot
            key={place.id}
            place={place}
            active={activePlace === place.id}
            hint={activePlace === null && place.id === "ministers"}
            onSelect={() => onSelectPlace(place.id)}
          />
        ))}

      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.55} luminanceSmoothing={0.2} intensity={lowPower ? 0.9 : 1.25} />
        <Vignette offset={0.25} darkness={0.75} />
      </EffectComposer>
    </Canvas>
  );
}
