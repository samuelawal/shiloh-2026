import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Registration, StoredRegistration } from "./registration";

// File-backed store for local development. Swap this module for a real
// database (Postgres, Supabase, Firestore…) before deploying to serverless.
const DATA_FILE = path.join(process.cwd(), "data", "registrations.json");

async function readAll(): Promise<StoredRegistration[]> {
  try {
    return JSON.parse(await readFile(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function generateId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return "SHL26-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function saveRegistration(data: Registration): Promise<StoredRegistration> {
  const all = await readAll();
  const existing = all.find((r) => r.email.toLowerCase() === data.email.toLowerCase());
  if (existing) return existing;

  const record: StoredRegistration = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify([...all, record], null, 2));
  return record;
}

export async function findRegistration(id: string): Promise<StoredRegistration | undefined> {
  return (await readAll()).find((r) => r.id === id);
}
