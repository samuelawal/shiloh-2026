import type { Metadata } from "next";
import { ExperienceLoader } from "@/components/experience/ExperienceLoader";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `${EVENT.name} | Enter Canaanland`,
};

export default function Home() {
  return <ExperienceLoader />;
}
