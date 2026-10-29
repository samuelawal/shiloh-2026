"use client";

import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FarAbove, ShilohMark } from "@/components/Brand";
import { EVENT, LINKS } from "@/lib/event";
import {
  loadMap,
  type MapData,
  PILLARS,
  type PlaceId,
  PLACES,
  SERVICE_IDS,
} from "./config";
import { Embers } from "./Embers";
import { PlacePanel } from "./PlacePanel";
import { type Phase, Scene } from "./Scene";
import { Soundtrack } from "./soundtrack";
import { type Cue, PILLAR_DELAYS } from "./timeline";

const year = EVENT.name.slice(-2);
const shortDates = "8th – 13th Dec. 2026";

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

function Captions({ cue }: { cue: Cue | null }) {
  if (cue === "travel" || cue === "gate") {
    const lines =
      cue === "travel"
        ? [
            "From every nation, every street,",
            "they are coming up to Shiloh",
            "to Faith Tabernacle, Canaanland, Ota.",
          ]
        : [
            "Welcome to Canaanland,",
            "the Home of Signs and Wonders",
            "Idi-Iroko Road, Ota, Ogun State.",
          ];
    return (
      <div
        key={cue}
        className="absolute top-1/2 left-6 max-w-xl -translate-y-1/2 sm:left-24">
        <p className="caption-in font-display text-3xl text-white uppercase sm:text-5xl">
          {lines[0]}
        </p>
        <p className="caption-in font-display text-3xl text-accent uppercase [animation-delay:0.5s] sm:text-5xl">
          {lines[1]}
        </p>
        <p className="caption-in mt-2 text-sm font-semibold text-white [animation-delay:1s] sm:text-base">
          {lines[2]}
        </p>
      </div>
    );
  }
  if (cue === "tabernacle") {
    return (
      <div key={cue} className="absolute inset-x-6 top-[18%] text-center">
        <p className="caption-in text-xs font-bold tracking-[0.35em] text-accent uppercase">
          The altar is set
        </p>
        <p className="caption-in glow-text mt-3 font-display text-6xl text-white uppercase [animation-delay:0.3s] sm:text-8xl">
          Faith Tabernacle
        </p>
      </div>
    );
  }
  if (cue === "pillars") {
    return (
      <ul
        key={cue}
        className="absolute inset-x-4 bottom-[18%] flex flex-wrap justify-center gap-x-10 gap-y-3">
        {PILLARS.map((word, i) => (
          <li
            key={word}
            className="caption-in text-sm font-bold tracking-[0.3em] text-white uppercase sm:text-xl"
            style={{ animationDelay: `${PILLAR_DELAYS[i]}s` }}>
            {word}
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

function TitleBlock({ explore }: { explore: boolean }) {
  return (
    <div className="pointer-events-none absolute top-20 left-4 max-w-[90vw] sm:top-28 sm:left-16 [@media(max-height:500px)]:hidden">
      <p className="caption-in flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-accent uppercase sm:text-[11px] sm:tracking-[0.3em]">
        <ShilohMark className="size-10 text-[14px] tracking-normal text-cream normal-case sm:size-12 sm:text-[17px]" />
        {EVENT.host}
      </p>
      <h1 className="caption-in glow-text mt-3 text-cream [animation-delay:0.2s]">
        <FarAbove className="text-6xl sm:text-9xl" />
      </h1>
      <p className="caption-in mt-2 font-display text-lg tracking-[0.3em] text-accent [animation-delay:0.4s] sm:mt-3 sm:text-2xl">
        EPH. 1:20–21
      </p>
      <p className="caption-in mt-1 text-xs font-semibold tracking-wide text-white uppercase [animation-delay:0.6s] sm:mt-2 sm:text-sm">
        {shortDates} · {EVENT.timesLabel} · {EVENT.venue.name}
      </p>
      {explore && (
        <p className="caption-in mt-4 hidden text-xs text-white [animation-delay:1s] sm:block">
          Choose a place in Canaanland · drag to look around · scroll to zoom
        </p>
      )}
    </div>
  );
}

export default function Experience() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [starting, setStarting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [map, setMap] = useState<MapData | null>(null);
  const [cue, setCue] = useState<Cue | null>(null);
  const [activePlace, setActivePlace] = useState<PlaceId | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState<string | null>(null);
  const [audioReady, setAudioReady] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [lowPower, setLowPower] = useState(false);
  const introStartedAt = useRef(0);
  const soundtrack = useRef<Soundtrack | null>(null);

  useEffect(() => {
    setWebgl(supportsWebGL());
    setLowPower(
      window.matchMedia("(max-width: 768px)").matches ||
        (navigator.hardwareConcurrency ?? 8) <= 4,
    );
    loadMap(setProgress)
      .then(setMap)
      .catch(() => setWebgl(false));
    return () => soundtrack.current?.stop();
  }, []);

  const finishIntro = useCallback(() => {
    setCue(null);
    setPhase("explore");
    soundtrack.current?.boom();
  }, []);

  const beginIntro = useCallback(() => {
    // The voice and the intro clock start together so transitions land on its phrases.
    soundtrack.current?.playVoice();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("explore");
      return;
    }
    introStartedAt.current = performance.now();
    setPhase("intro");
    soundtrack.current?.swell(15.5);
  }, []);

  // Start once the visitor has said yes and both the map and the voice are ready.
  useEffect(() => {
    if (starting && audioReady && map && phase === "gate") beginIntro();
  }, [starting, audioReady, map, phase, beginIntro]);

  const start = async () => {
    setStarting(true);
    const track = new Soundtrack();
    soundtrack.current = track;
    await track.start();
    setTrackTitle(track.title);
    setAudioReady(true);
  };

  const onCue = useCallback((next: Cue | null) => {
    setCue(next);
    if (next === "pillars") soundtrack.current?.boom();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (phase === "intro") finishIntro();
      else if (panelOpen) setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, panelOpen, finishIntro]);

  const selectPlace = (id: PlaceId | null) => {
    setActivePlace(id);
    setPanelOpen(id !== null);
    // Leaving the screen stops the ministration.
    if (id !== "ministrations") setPlaying(null);
  };

  const playMinistration = (id: string) => {
    setPlaying(id);
    // Below laptop width the panel covers the screen, so get it out of the way.
    // Tapping Ministrations again brings the list back.
    if (!window.matchMedia("(min-width: 1280px)").matches) setPanelOpen(false);
  };

  // The soundtrack steps aside while a ministration plays on the altar screen.
  useEffect(() => {
    soundtrack.current?.setMuted(muted || playing !== null);
  }, [muted, playing]);

  const toggleMute = () => setMuted((m) => !m);

  if (!webgl) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#0f0805] px-6 text-center text-white">
        <div>
          <h1 className="font-display text-5xl uppercase">Shiloh 2026</h1>
          <p className="mt-3 text-white">
            Your browser can&apos;t show the 3D experience.
          </p>
          <Link href="/simple" className="btn-primary mt-6">
            Continue to the site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0f0805] text-white select-none">
      <div
        className={`absolute inset-0 transition-[filter] duration-[1500ms] ${
          phase === "gate" ? "scale-105 blur-md brightness-50" : ""
        }`}>
        {map && (
          <Scene
            map={map}
            phase={phase}
            introStartedAt={introStartedAt}
            activePlace={activePlace}
            playing={playing}
            lowPower={lowPower}
            onCue={onCue}
            onIntroEnd={finishIntro}
            onSelectPlace={selectPlace}
          />
        )}
      </div>

      <Embers density={phase === "gate" ? 1 : 0.5} />

      <div className="pointer-events-none absolute inset-0 z-30">
        {/* Top bar */}
        <header className="pointer-events-auto absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="Shiloh 2026">
            <span className="grid size-9 place-items-center rounded-full bg-white p-0.5">
              <Image
                src="/images/lfc-logo.gif"
                alt=""
                width={32}
                height={35}
                unoptimized
              />
            </span>
            <ShilohMark className="hidden size-10 text-[14px] sm:inline-grid" />
          </Link>
          <div className="flex items-center gap-2">
            {phase !== "gate" && (
              <>
                <a
                  href={LINKS.give}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm backdrop-blur hover:bg-white/10 sm:block">
                  Give
                </a>
                {trackTitle && !playing && (
                  <span className="hidden items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm backdrop-blur md:flex">
                    <span className="text-[10px] tracking-widest text-white uppercase">
                      Now playing
                    </span>{" "}
                    {trackTitle}
                  </span>
                )}
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute" : "Mute"}
                  className="grid size-9 place-items-center rounded-full border border-white/15 bg-black/30 backdrop-blur hover:bg-white/10">
                  {muted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
              </>
            )}
            <a
              href={LINKS.youtube}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#fff4e6] px-4 py-2 text-sm font-semibold text-black hover:bg-white">
              Watch live
            </a>
          </div>
        </header>

        {/* Gate */}
        {phase === "gate" && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="caption-in absolute top-20 px-4 text-[10px] tracking-[0.2em] text-accent uppercase sm:top-24 sm:text-xs sm:tracking-[0.3em] [@media(max-height:500px)]:hidden">
              Shiloh ’{year} · {shortDates} · Canaanland, Ota
            </p>
            <h1 className="caption-in glow-text text-cream">
              <FarAbove className="text-[22vw] sm:text-9xl md:text-[10rem] [@media(max-height:500px)]:text-7xl" />
            </h1>
            <p className="caption-in mt-4 font-display text-xl tracking-wide text-accent uppercase [animation-delay:0.2s] sm:text-3xl">
              Are you ready to go far above?
            </p>
            <button
              type="button"
              onClick={start}
              disabled={starting}
              className="caption-in relative mt-10 min-w-56 overflow-hidden rounded-full border border-sun/80 bg-black/60 px-8 py-4 text-base text-white shadow-[0_0_40px_rgba(232,112,20,0.35)] transition [animation-delay:0.3s] hover:shadow-[0_0_60px_rgba(232,112,20,0.6)]">
              {starting
                ? `Preparing the altar… ${Math.round(progress * 100)}%`
                : "Yes, I’m ready"}
              {starting && (
                <span className="absolute inset-x-6 bottom-2 h-0.5 rounded bg-white/10">
                  <span
                    className="block h-full rounded bg-sun transition-[width]"
                    style={{ width: `${progress * 100}%` }}
                  />
                </span>
              )}
            </button>
            <p className="caption-in mt-4 text-xs text-white [animation-delay:0.5s]">
              {starting
                ? "Starting as soon as Canaanland is ready"
                : "Sound on · about 26 seconds · skip any time"}
            </p>
            <Link
              href="/simple"
              className="caption-in mt-8 text-xs text-white underline underline-offset-4 [animation-delay:0.7s] hover:text-white">
              Skip to simple view
            </Link>
          </div>
        )}

        {/* Intro */}
        {phase === "intro" && (
          <>
            <Captions cue={cue} />
            {cue === "title" && <TitleBlock explore={false} />}
            <button
              type="button"
              onClick={finishIntro}
              className="pointer-events-auto absolute right-6 bottom-6 flex items-center gap-3 rounded-full border border-white/15 bg-black/40 px-5 py-2.5 text-sm backdrop-blur hover:bg-white/10">
              Skip{" "}
              <kbd className="rounded border border-white/20 px-1.5 text-[10px] text-white">
                Esc
              </kbd>
            </button>
          </>
        )}

        {/* Explore */}
        {phase === "explore" && (
          <>
            {!panelOpen && !playing && <TitleBlock explore />}
            {panelOpen && activePlace && (
              <PlacePanel
                place={activePlace}
                playing={playing}
                onPlay={playMinistration}
                onSelect={selectPlace}
                onClose={() => setPanelOpen(false)}
              />
            )}

            <nav
              aria-label="Places"
              className="pointer-events-auto absolute inset-x-3 bottom-5 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/50 p-1.5 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => selectPlace(null)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  activePlace === null
                    ? "bg-[#fff4e6] text-black"
                    : "text-white hover:text-white"
                }`}>
                Overview
              </button>
              {PLACES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPlace(p.id)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                    activePlace === p.id
                      ? "bg-sun text-white shadow-[0_0_20px_rgba(232,112,20,0.6)]"
                      : "text-white hover:text-white"
                  }`}>
                  {p.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => selectPlace("help")}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                  activePlace && SERVICE_IDS.has(activePlace)
                    ? "bg-sun text-white shadow-[0_0_20px_rgba(232,112,20,0.6)]"
                    : "text-white hover:text-white"
                }`}>
                Services
              </button>
            </nav>

            <div className="pointer-events-auto absolute bottom-7 left-6 hidden items-center gap-4 text-xs text-white lg:flex">
              <Link
                href="/simple"
                className="underline underline-offset-4 hover:text-white">
                Simple view
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
