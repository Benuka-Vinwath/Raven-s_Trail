import clsx from "clsx";

interface Props {
  name: string;
  src?: string | null;
  className?: string;
}

// Photo if the person uploaded one, otherwise their initial on a forest circle.
export default function Avatar({ name, src, className = "h-9 w-9 text-sm" }: Props) {
  return src ? (
    <img src={src} alt={name} className={clsx("shrink-0 rounded-full object-cover", className)} />
  ) : (
    <span
      aria-hidden
      className={clsx("flex shrink-0 items-center justify-center rounded-full bg-forest-600 font-medium text-white", className)}
    >
      {name.trim().charAt(0).toUpperCase() || "?"}
    </span>
  );
}
