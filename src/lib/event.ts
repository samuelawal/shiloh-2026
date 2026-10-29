// Single source of truth for Shiloh 2026 event content.
// Dates, times, venue and scripture follow the official Shiloh 2026 flyer.
// Day themes are placeholders until the church publishes the full programme.

export const EVENT = {
  name: "Shiloh 2026",
  theme: "Far Above",
  scripture: {
    text: "Which he wrought in Christ, when he raised him from the dead, and set him at his own right hand in the heavenly places, far above all principality, and power, and might, and dominion, and every name that is named, not only in this world, but also in that which is to come.",
    reference: "Ephesians 1:20–21",
  },
  host: "Living Faith Church Worldwide",
  convener: "Bishop David O. Oyedepo",
  startsAt: "2026-12-08T19:00:00+01:00",
  endsAt: "2026-12-13T22:00:00+01:00",
  datesLabel: "Tuesday 8 – Sunday 13 December 2026",
  datesConfirmed: true,
  timesLabel: "7 AM & 7 PM daily (WAT)",
  broadcast: "With live broadcast to all viewing centres",
  venue: {
    name: "Faith Tabernacle, Canaanland",
    address: "Km 10, Idiroko Road, Ota, Ogun State, Nigeria",
    mapUrl: "https://maps.google.com/?q=Faith+Tabernacle+Canaanland+Ota",
  },
} as const;

export const LINKS = {
  website: "https://faithtabernacle.org.ng",
  youtube: "https://www.youtube.com/@lfcww",
  domiRadio: "https://faithtabernacle.org.ng",
  give: "https://faithtabernacle.org.ng",
} as const;

export type Session = { time: string; title: string; note?: string };
export type ProgrammeDay = {
  day: string;
  date: string;
  title: string;
  sessions: Session[];
};

export const PROGRAMME: ProgrammeDay[] = [
  {
    day: "Day 1",
    date: "Tue, 8 Dec",
    title: "Opening Service",
    sessions: [
      {
        time: "7:00 PM",
        title: "Opening Service",
        note: "Evening session only",
      },
    ],
  },
  {
    day: "Day 2",
    date: "Wed, 9 Dec",
    title: "Word & Wonders",
    sessions: [
      { time: "7:00 AM", title: "Morning Session" },
      { time: "7:00 PM", title: "Evening Session" },
    ],
  },
  {
    day: "Day 3",
    date: "Thu, 10 Dec",
    title: "Encounter Night",
    sessions: [
      { time: "7:00 AM", title: "Morning Session" },
      { time: "7:00 PM", title: "Evening Session" },
    ],
  },
  {
    day: "Day 4",
    date: "Fri, 11 Dec",
    title: "Healing & Deliverance",
    sessions: [
      { time: "7:00 AM", title: "Morning Session" },
      { time: "7:00 PM", title: "Evening Session" },
    ],
  },
  {
    day: "Day 5",
    date: "Sat, 12 Dec",
    title: "Impartation Day",
    sessions: [
      { time: "7:00 AM", title: "Morning Session" },
      { time: "7:00 PM", title: "Evening Session" },
    ],
  },
  {
    day: "Day 6",
    date: "Sun, 13 Dec",
    title: "Grand Thanksgiving",
    sessions: [
      { time: "7:00 AM", title: "Morning Session" },
      { time: "7:00 PM", title: "Evening Session" },
    ],
  },
];

export const MINISTERING = {
  lead: "Bishop David Oyedepo",
  others: "And other anointed ministers of God",
};

export type Minister = { name: string; role?: string; photo?: string };

export const MINISTERS: Minister[] = [
  { name: "Bishop David Oyedepo", role: "Presiding Bishop & Convener", photo: "/images/ministers/david-oyedepo.jpg" },
  { name: "Pastor David Oyedepo Jnr", photo: "/images/ministers/david-oyedepo-jnr.jpg" },
  { name: "Pastor Faith Oyedepo", photo: "/images/ministers/faith-oyedepo.jpg" },
  { name: "Pastor Paul Enenche", photo: "/images/ministers/paul-enenche.jpg" },
  { name: "Pastor David Ibiyeomie", photo: "/images/ministers/david-ibiyeomie.jpg" },
  { name: "Pastor Steve Ogah", photo: "/images/ministers/steve-ogah.jpg" },
];

export const HOST = {
  ...MINISTERS[0],
  bio: "Bishop David O. Oyedepo is the founder and Presiding Bishop of Living Faith Church Worldwide, a commission he began in 1981 with a mandate to liberate the world through the preaching of the Word of faith. From Faith Tabernacle, Canaanland, the ministry has spread across Nigeria, Africa and the nations, and every December he convenes Shiloh, calling believers up to the mountain of the Lord.",
};

// Photos licensed from Wikimedia Commons (CC BY-SA 4.0), which must be credited.
export const PHOTO_CREDITS = [
  { subject: "Pastor Paul Enenche", author: "Ssani3", url: "https://commons.wikimedia.org/wiki/File:Pastor_Paul_Enenche.jpg" },
];

export type Faq = { question: string; answer: string };

export const FAQS: Faq[] = [
  {
    question: "Do I need to be a member of Living Faith Church to attend?",
    answer:
      "No. Shiloh is open to everyone — members, guests, ministers and delegates from other churches and nations are all welcome.",
  },
  {
    question: "What should I bring?",
    answer:
      "Your Bible, notebook, writing pen, anointing oil, communion elements for the covenant sessions, and comfortable clothing. Keep valuables to a minimum.",
  },
  {
    question: "Can I watch Shiloh online?",
    answer:
      "Yes. Every session streams live on the Faith Tabernacle website, the Shiloh website, YouTube and Domi Radio. Many Shiloh viewing centres worldwide also stream live.",
  },
  {
    question: "How do I get to Canaanland?",
    answer:
      "Canaanland is on Idiroko Road, Ota, about 45 minutes from Lagos Murtala Muhammed Airport. Designated shuttle buses run from key points in Lagos and Ogun State during Shiloh.",
  },
];
