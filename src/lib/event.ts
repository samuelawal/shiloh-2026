// Single source of truth for Shiloh 2026 event content.
// Dates and session times follow the pattern of previous editions and
// should be updated once the church publishes the official programme.

export const EVENT = {
  name: "Shiloh 2026",
  theme: "Far Above",
  scripture: {
    text: "Far above all principality, and power, and might, and dominion, and every name that is named, not only in this world, but also in that which is to come.",
    reference: "Ephesians 1:21",
  },
  host: "Living Faith Church Worldwide",
  convener: "Bishop David O. Oyedepo",
  startsAt: "2026-12-08T07:00:00+01:00",
  endsAt: "2026-12-13T14:00:00+01:00",
  datesLabel: "Tuesday 8 – Sunday 13 December 2026",
  datesConfirmed: false,
  venue: {
    name: "Faith Tabernacle, Canaanland",
    address: "Km 10, Idiroko Road, Ota, Ogun State, Nigeria",
    mapUrl: "https://maps.google.com/?q=Faith+Tabernacle+Canaanland+Ota",
  },
} as const;

export const LINKS = {
  website: "https://faithtabernacle.org.ng",
  youtube: "https://www.youtube.com/@FaithTabernacleOta",
  dominionTv: "https://dominionmedia.tv",
  domiRadio: "https://faithtabernacle.org.ng",
  give: "https://faithtabernacle.org.ng",
} as const;

export type Session = { time: string; title: string; note?: string };
export type ProgrammeDay = { day: string; date: string; title: string; sessions: Session[] };

export const PROGRAMME: ProgrammeDay[] = [
  {
    day: "Day 1",
    date: "Tue, 8 Dec",
    title: "Opening Service",
    sessions: [
      { time: "7:00 AM", title: "Covenant Hour of Prayer" },
      { time: "9:00 AM", title: "Opening Ceremony & Charge", note: "Bishop David O. Oyedepo" },
      { time: "5:00 PM", title: "Evening Word Session" },
    ],
  },
  {
    day: "Day 2",
    date: "Wed, 9 Dec",
    title: "Word & Wonders",
    sessions: [
      { time: "7:00 AM", title: "Covenant Hour of Prayer" },
      { time: "9:00 AM", title: "Morning Word Session" },
      { time: "5:00 PM", title: "Hour of Visitation" },
    ],
  },
  {
    day: "Day 3",
    date: "Thu, 10 Dec",
    title: "Encounter Night",
    sessions: [
      { time: "7:00 AM", title: "Covenant Hour of Prayer" },
      { time: "9:00 AM", title: "Morning Word Session" },
      { time: "6:00 PM", title: "Encounter Night", note: "All-night service" },
    ],
  },
  {
    day: "Day 4",
    date: "Fri, 11 Dec",
    title: "Healing & Deliverance",
    sessions: [
      { time: "7:00 AM", title: "Covenant Hour of Prayer" },
      { time: "9:00 AM", title: "Healing & Deliverance Service" },
      { time: "5:00 PM", title: "Evening Word Session" },
    ],
  },
  {
    day: "Day 5",
    date: "Sat, 12 Dec",
    title: "Impartation Day",
    sessions: [
      { time: "7:00 AM", title: "Covenant Hour of Prayer" },
      { time: "9:00 AM", title: "Ministers' & Leaders' Session" },
      { time: "5:00 PM", title: "Impartation Service" },
    ],
  },
  {
    day: "Day 6",
    date: "Sun, 13 Dec",
    title: "Grand Thanksgiving",
    sessions: [
      { time: "7:00 AM", title: "Thanksgiving Service", note: "Single service" },
      { time: "12:00 PM", title: "Closing & Prophetic Release" },
    ],
  },
];

export type Minister = { name: string; role: string };

export const MINISTERS: Minister[] = [
  { name: "Bishop David O. Oyedepo", role: "Presiding Bishop & Convener" },
  { name: "Pastor Faith A. Oyedepo", role: "Co-Convener" },
  { name: "Bishop David Abioye", role: "First Vice President" },
  { name: "Pastor David Oyedepo Jr.", role: "Senior Pastor" },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "Is registration free?",
    answer:
      "Yes. Attending Shiloh is free. Registering online helps us plan seating, accommodation, transport and security, and gets you a delegate pass you can show at the gate.",
  },
  {
    question: "Do I need to be a member of Living Faith Church to attend?",
    answer:
      "No. Shiloh is open to everyone — members, guests, ministers and delegates from other churches and nations are all welcome.",
  },
  {
    question: "Is accommodation available within Canaanland?",
    answer:
      "Limited hostel and camp accommodation is available on a first-come basis. Indicate your need when registering and the accommodation team will reach out. Hotels in Ota and Lagos are also an option.",
  },
  {
    question: "What should I bring?",
    answer:
      "Your Bible, notebook, delegate pass (printed or on your phone), anointing oil, communion elements for the covenant sessions, and comfortable clothing. Keep valuables to a minimum.",
  },
  {
    question: "Are there arrangements for children and teenagers?",
    answer:
      "Yes. Children's Church and Teens' Church run concurrently with the main sessions. Children must be registered and signed in by a parent or guardian.",
  },
  {
    question: "Can I watch Shiloh online?",
    answer:
      "Every session streams live on the Faith Tabernacle YouTube channel, Dominion TV and Domi Radio. Many branches worldwide also link up live.",
  },
  {
    question: "How do I get to Canaanland?",
    answer:
      "Canaanland is on Idiroko Road, Ota, about 45 minutes from Lagos Murtala Muhammed Airport. Designated shuttle buses run from key points in Lagos and Ogun State during Shiloh.",
  },
];
