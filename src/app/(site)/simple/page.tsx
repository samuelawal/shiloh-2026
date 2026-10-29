import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { Ministers } from "@/components/home/Ministers";
import { Ministrations } from "@/components/home/Ministrations";
import { Programme } from "@/components/home/Programme";
import { Travel } from "@/components/home/Travel";
import { WatchAndGive } from "@/components/home/WatchAndGive";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Programme />
      <Ministers />
      <Ministrations />
      <Travel />
      <Faq />
      <WatchAndGive />
    </>
  );
}
