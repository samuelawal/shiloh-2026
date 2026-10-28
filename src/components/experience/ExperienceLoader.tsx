"use client";

import dynamic from "next/dynamic";

// three.js needs the browser, so the experience is never server-rendered.
export const ExperienceLoader = dynamic(() => import("./Experience"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#07060b]" />,
});
