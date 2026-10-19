interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export default function SectionHeading({ eyebrow, title, description, align = "left" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && <p className="text-clay-600 font-medium text-sm mb-2">{eyebrow}</p>}
      <h2 className="font-display text-3xl sm:text-4xl text-ink-900 leading-tight">{title}</h2>
      {description && <p className="mt-3 text-ink-700/80 leading-relaxed">{description}</p>}
    </div>
  );
}
