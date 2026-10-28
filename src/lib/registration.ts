import { z } from "zod";

export const CATEGORIES = [
  { value: "member", label: "LFC Member" },
  { value: "guest", label: "Guest / First-timer" },
  { value: "minister", label: "Minister / Pastor" },
  { value: "international", label: "International Delegate" },
] as const;

export const ACCOMMODATION = [
  { value: "none", label: "I don't need accommodation" },
  { value: "camp", label: "Canaanland camp / hostel" },
  { value: "hotel", label: "Help me find a hotel nearby" },
] as const;

export const TRAVEL_MODES = [
  { value: "road", label: "By road" },
  { value: "air", label: "By air" },
  { value: "shuttle", label: "Church shuttle" },
] as const;

export const ATTENDANCE_DAYS = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6"] as const;

const values = <T extends readonly { value: string }[]>(items: T) =>
  items.map((item) => item.value) as [T[number]["value"], ...T[number]["value"][]];

export const registrationSchema = z.object({
  firstName: z.string().trim().min(2, "Enter your first name"),
  lastName: z.string().trim().min(2, "Enter your last name"),
  email: z.email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
  gender: z.enum(["male", "female"], { message: "Select your gender" }),
  country: z.string().trim().min(2, "Enter your country"),
  city: z.string().trim().min(2, "Enter your city or state"),

  category: z.enum(values(CATEGORIES), { message: "Select a category" }),
  church: z.string().trim().max(120).optional(),
  days: z.array(z.enum(ATTENDANCE_DAYS)).min(1, "Select at least one day"),
  groupSize: z.coerce.number().int().min(1, "At least 1").max(50, "For groups above 50, contact us"),

  accommodation: z.enum(values(ACCOMMODATION)),
  travelMode: z.enum(values(TRAVEL_MODES)),
  specialNeeds: z.string().trim().max(500).optional(),

  consent: z.literal(true, { message: "Please accept to continue" }),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type Registration = z.output<typeof registrationSchema>;

export type StoredRegistration = Registration & { id: string; createdAt: string };

export const labelFor = (items: readonly { value: string; label: string }[], value: string) =>
  items.find((item) => item.value === value)?.label ?? value;
