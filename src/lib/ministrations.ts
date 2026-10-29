// Past Shiloh ministrations, streamed on the official Living Faith Church
// Worldwide YouTube channel. Shown on the altar screen in the 3D experience
// and in the /simple page. Newest first.

export type Ministration = { id: string; year: number; theme: string; title: string; date: string };

export const MINISTRATIONS: Ministration[] = [
  { id: "Q9cY8US2jBQ", year: 2025, theme: "Breaking New Grounds", title: "Opening Night Session", date: "9 Dec 2025" },
  { id: "MMTLMdCJZMQ", year: 2025, theme: "Breaking New Grounds", title: "Hour of Visitation · Day 2", date: "10 Dec 2025" },
  { id: "M-H2jHETSKg", year: 2025, theme: "Breaking New Grounds", title: "Encounter Night · Day 2", date: "10 Dec 2025" },
  { id: "HE4A8wtG8jQ", year: 2025, theme: "Breaking New Grounds", title: "Impartation Service · Day 5", date: "13 Dec 2025" },
  { id: "ij8XFz-Jxrc", year: 2025, theme: "Breaking New Grounds", title: "Thanksgiving Service · Day 6", date: "14 Dec 2025" },
  { id: "waaD-YbMOpE", year: 2024, theme: "Ever Winning Wisdom", title: "Opening Session · Day 1", date: "10 Dec 2024" },
  { id: "T-0ImDhyVwA", year: 2024, theme: "Ever Winning Wisdom", title: "Hour of Visitation · Day 2", date: "11 Dec 2024" },
  { id: "gayamH659as", year: 2024, theme: "Ever Winning Wisdom", title: "Celebration Night · Day 4", date: "13 Dec 2024" },
  { id: "Ga98XGesxHo", year: 2024, theme: "Ever Winning Wisdom", title: "Impartation Service · Day 5", date: "14 Dec 2024" },
  { id: "I62c0gYtWao", year: 2023, theme: "Redeemed to Flourish in Hard Times", title: "Opening Session · Day 1", date: "Dec 2023" },
  { id: "RvOZ3umcG7c", year: 2023, theme: "Redeemed to Flourish in Hard Times", title: "Impartation Service · Day 5", date: "Dec 2023" },
];

export const thumbnail = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;

/** Embed URL. Autoplays muted unless the visitor chose the video themselves. */
export function embedUrl(id: string, { muted = false } = {}) {
  const params = new URLSearchParams({ autoplay: "1", mute: muted ? "1" : "0", rel: "0", modestbranding: "1", playsinline: "1" });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}
