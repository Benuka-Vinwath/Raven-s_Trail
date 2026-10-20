import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "light" | "glass";
type Size = "md" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,border-color,box-shadow,color] duration-500 ease-smooth disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-clay-600 text-white hover:bg-clay-700 shadow-[0_0_0_rgba(181,80,47,0)] hover:shadow-[0_10px_30px_-8px_rgba(181,80,47,0.55)]",
  secondary:
    "bg-forest-600 text-white hover:bg-forest-700 shadow-[0_0_0_rgba(47,82,51,0)] hover:shadow-[0_10px_30px_-8px_rgba(47,82,51,0.5)]",
  ghost:
    "bg-transparent text-forest-700 border border-forest-600/30 hover:border-forest-600 hover:bg-forest-600/5 shadow-[0_0_0_rgba(47,82,51,0)] hover:shadow-[0_10px_24px_-10px_rgba(47,82,51,0.35)]",
  light: "bg-white text-pine-950 hover:bg-white/85",
  glass: "bg-white/10 text-white border border-white/25 hover:bg-white/20",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-[0.95rem] rounded-xl",
  sm: "px-3.5 py-1.5 text-sm rounded-xl",
};

const hover = {
  scale: 1.035,
  y: -2,
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

const tap = {
  scale: 0.97,
  y: 0,
  transition: { duration: 0.15, ease: [0.4, 0, 1, 1] as const },
};

const MotionLink = motion.create(Link);

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

type MotionConflictingProps = "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd";

interface ButtonAsButton extends CommonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictingProps> {
  to?: undefined;
}

interface ButtonAsLink
  extends CommonProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | MotionConflictingProps> {
  to: string;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({ variant = "primary", size = "md", className, children, ...props }: ButtonProps) {
  const classes = clsx(base, variants[variant], sizes[size], className);

  if ("to" in props && props.to) {
    const { to, ...rest } = props;
    return (
      <MotionLink to={to} className={classes} whileHover={hover} whileTap={tap} {...rest}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.button
      className={classes}
      whileHover={hover}
      whileTap={tap}
      {...(props as Omit<ButtonHTMLAttributes<HTMLButtonElement>, MotionConflictingProps>)}
    >
      {children}
    </motion.button>
  );
}
