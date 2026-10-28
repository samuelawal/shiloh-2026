// Practical services for delegates. Shared by the 3D experience and /simple.
// Details follow the pattern of previous Shiloh editions; confirm specifics
// (pick-up points, desk locations, opening times) with the organising team.

export type ServiceId = "accommodation" | "shuttles" | "medical" | "help" | "bookshop";

export type Service = {
  id: ServiceId;
  title: string;
  summary: string;
  details: string[];
  cta?: { label: string; href: string };
};

export const SERVICES: Service[] = [
  {
    id: "accommodation",
    title: "Accommodation",
    summary:
      "Hostel and camp spaces in Canaanland are allocated on request, first come, first served. Hotels in Ota and Lagos are an alternative for families.",
    details: [
      "Request accommodation when you register",
      "Check in at the accommodation desk with your delegate pass",
      "Bring bedding, toiletries and a torch",
      "Keep valuables to a minimum",
    ],
    cta: { label: "Request accommodation", href: "/register" },
  },
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
    cta: { label: "Ask for a shuttle when you register", href: "/register" },
  },
  {
    id: "medical",
    title: "Medical",
    summary: "Medical teams and first-aid posts are on hand across the grounds, with ambulances on standby throughout the week.",
    details: [
      "Any usher can direct you to the nearest first-aid post",
      "Bring the medication you need, with a copy of your prescription",
      "Drink plenty of water during the day",
      "Note medical or accessibility needs when you register",
    ],
  },
  {
    id: "help",
    title: "Help desk",
    summary:
      "Ushers, security and the welcome team are there to receive first-timers, guide you to a seat and keep everyone safe.",
    details: [
      "First time at Shiloh? Start at the welcome and help desk",
      "Keep your delegate pass with you: it is checked at the gate",
      "Lost property and missing persons are handled at the help desk",
      "Children must be signed in and out by a parent or guardian",
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
