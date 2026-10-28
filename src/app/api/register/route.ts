import { NextResponse } from "next/server";
import { z } from "zod";
import { registrationSchema } from "@/lib/registration";
import { saveRegistration } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = registrationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid registration details", fields: z.flattenError(parsed.error).fieldErrors },
      { status: 422 },
    );
  }

  const registration = await saveRegistration(parsed.data);
  return NextResponse.json({ id: registration.id }, { status: 201 });
}
