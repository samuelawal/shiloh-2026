export function SectionHeader({
  eyebrow,
  title,
  description,
  light = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  light?: boolean;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className={`eyebrow ${light ? "text-accent" : ""}`}>{eyebrow}</p>
      <h2 className={`heading mt-3 ${light ? "text-white" : ""}`}>{title}</h2>
      {description && <p className={`mt-4 text-base leading-relaxed ${light ? "text-white" : "text-muted"}`}>{description}</p>}
    </div>
  );
}
