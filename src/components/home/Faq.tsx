import { ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { FAQS } from "@/lib/event";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="container-page max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Questions people ask" />

        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-black/10 bg-cream px-6 py-5 open:bg-white open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                {faq.question}
                <ChevronDown className="size-5 shrink-0 text-flame transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
