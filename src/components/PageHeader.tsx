export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <section className="sky-gradient no-print relative isolate overflow-hidden pt-32 pb-16 text-center">
      <div className="stars absolute inset-0 -z-10" aria-hidden />
      <div className="container-page max-w-2xl">
        <p className="eyebrow text-accent">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 text-white">{description}</p>}
      </div>
    </section>
  );
}
