"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ACCOMMODATION,
  ATTENDANCE_DAYS,
  CATEGORIES,
  type Registration,
  type RegistrationInput,
  registrationSchema,
  TRAVEL_MODES,
} from "@/lib/registration";

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: { message?: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="field-label">{label}</label>
      {children}
      {error?.message && <p className="field-error">{error.message}</p>}
    </div>
  );
}

function Fieldset({ title, step, children }: { title: string; step: number; children: React.ReactNode }) {
  return (
    <fieldset className="card p-6 sm:p-8">
      <legend className="sr-only">{title}</legend>
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-wine text-sm font-bold text-accent">{step}</span>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export function RegistrationForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput, unknown, Registration>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { days: [...ATTENDANCE_DAYS], groupSize: 1, accommodation: "none", travelMode: "road", country: "Nigeria" },
  });

  const onSubmit = async (data: Registration) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      const { id } = (await response.json()) as { id: string };
      router.push(`/pass/${id}`);
    } catch {
      setSubmitError("We couldn't complete your registration. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <Fieldset step={1} title="Your details">
        <Field label="First name" error={errors.firstName}>
          <input className="field-input" autoComplete="given-name" {...register("firstName")} />
        </Field>
        <Field label="Last name" error={errors.lastName}>
          <input className="field-input" autoComplete="family-name" {...register("lastName")} />
        </Field>
        <Field label="Email address" error={errors.email}>
          <input type="email" className="field-input" autoComplete="email" {...register("email")} />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input type="tel" className="field-input" autoComplete="tel" placeholder="+234 801 234 5678" {...register("phone")} />
        </Field>
        <Field label="Gender" error={errors.gender}>
          <select className="field-input" defaultValue="" {...register("gender")}>
            <option value="" disabled>
              Select…
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Country" error={errors.country}>
          <input className="field-input" autoComplete="country-name" {...register("country")} />
        </Field>
        <Field label="City / State" error={errors.city} className="sm:col-span-2">
          <input className="field-input" autoComplete="address-level2" {...register("city")} />
        </Field>
      </Fieldset>

      <Fieldset step={2} title="Attendance">
        <Field label="I am attending as" error={errors.category}>
          <select className="field-input" defaultValue="" {...register("category")}>
            <option value="" disabled>
              Select…
            </option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Church / Branch (optional)" error={errors.church}>
          <input className="field-input" placeholder="e.g. Winners Chapel, Ikeja" {...register("church")} />
        </Field>
        <Field label="Number of people (including you)" error={errors.groupSize}>
          <input type="number" min={1} max={50} className="field-input" {...register("groupSize")} />
        </Field>
        <Field label="Days attending" error={errors.days} className="sm:col-span-2">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ATTENDANCE_DAYS.map((day) => (
              <label
                key={day}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-black/10 px-1 py-2.5 text-sm font-semibold whitespace-nowrap sm:px-3 has-checked:border-wine has-checked:bg-wine has-checked:text-white"
              >
                <input type="checkbox" value={day} className="sr-only" {...register("days")} />
                {day}
              </label>
            ))}
          </div>
        </Field>
      </Fieldset>

      <Fieldset step={3} title="Travel & accommodation">
        <Field label="How will you travel?" error={errors.travelMode}>
          <select className="field-input" {...register("travelMode")}>
            {TRAVEL_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Accommodation" error={errors.accommodation}>
          <select className="field-input" {...register("accommodation")}>
            {ACCOMMODATION.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Medical or accessibility needs (optional)" error={errors.specialNeeds} className="sm:col-span-2">
          <textarea rows={3} className="field-input" {...register("specialNeeds")} />
        </Field>
      </Fieldset>

      <div className="card p-6 sm:p-8">
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" className="mt-1 size-4 accent-flame" {...register("consent")} />
          <span>
            I agree that Living Faith Church Worldwide may use these details to organise Shiloh 2026 and contact me
            about my registration.
          </span>
        </label>
        {errors.consent && <p className="field-error">{errors.consent.message}</p>}

        {submitError && (
          <p role="alert" className="mt-5 rounded-xl bg-flame/10 px-4 py-3 text-sm font-semibold text-flame">
            {submitError}
          </p>
        )}

        <button type="submit" disabled={isSubmitting} className="btn-primary mt-6 w-full py-4 text-base">
          {isSubmitting && <LoaderCircle className="size-5 animate-spin" />}
          {isSubmitting ? "Registering…" : "Complete registration"}
        </button>
      </div>
    </form>
  );
}
