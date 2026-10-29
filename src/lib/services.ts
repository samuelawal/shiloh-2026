// Practical services for delegates. Shared by the 3D experience and /simple.
// Details follow the pattern of previous Shiloh editions; confirm specifics
// (pick-up points, desk locations, opening times) with the organising team.

export type ServiceId = "shuttles" | "help" | "bookshop";

export type Service = {
  id: ServiceId;
  title: string;
  summary: string;
  details: string[];
  cta?: { label: string; href: string };
};

export const SERVICES: Service[] = [
  {
    id: "shuttles",
    title: "Shuttles",
    summary:
      "Shiloh shuttles run from pick-up points across Lagos and Ogun State and drop delegates at the bus park inside the Canaanland gate.",
    details: [
      "Pick-up points and times are announced before Shiloh",
      "Buses run before morning sessions and after evening sessions",
      "Arrive early: buses leave when full",
      "Driving? Park in the marked car parks and follow the traffic marshals",
    ],
  },
  {
    id: "help",
    title: "Help desk",
    summary:
      "Ushers, security and the welcome team are there to receive first-timers, guide you to a seat and keep everyone safe.",
    details: [
      "First time at Shiloh? Start at the welcome and help desk",
      "Lost property and missing persons are handled at the help desk",
      "Foreign delegates: get in touch with the Protocol Help Desk team",
    ],
  },
  {
    id: "bookshop",
    title: "Bookshop",
    summary:
      "Books and messages by Bishop David O. Oyedepo and other ministers are available at the bookshop, and new titles are often released during Shiloh.",
    details: [
      "Open before and after sessions",
      "Session messages are made available during the week",
      "Look out for new releases announced from the altar",
    ],
  },
];
