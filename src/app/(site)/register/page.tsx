import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { RegistrationForm } from "@/components/register/RegistrationForm";
import { EVENT } from "@/lib/event";

export const metadata: Metadata = {
  title: `Register | ${EVENT.name}`,
  description: `Register free for ${EVENT.name} and get your delegate pass.`,
};

export default function RegisterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free registration"
        title="Register for Shiloh 2026"
        description={`${EVENT.datesLabel} · ${EVENT.venue.name}. It takes about two minutes, and you'll get a delegate pass to show at the gate.`}
      />
      <div className="container-page max-w-3xl py-12 sm:py-16">
        <RegistrationForm />
      </div>
    </>
  );
}
