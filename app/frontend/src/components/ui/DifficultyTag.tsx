import type { Difficulty } from "../../types";

const CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: "Easy", color: "var(--color-forest-500)" },
  moderate: { label: "Moderate", color: "var(--color-gold-500)" },
  hard: { label: "Hard", color: "var(--color-clay-600)" },
};

export default function DifficultyTag({ difficulty }: { difficulty: Difficulty }) {
  const { label, color } = CONFIG[difficulty];
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
