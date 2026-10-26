import type { InputHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import RavenMark from "../icons/RavenMark";

const ease = [0.22, 1, 0.36, 1] as const;

interface AuthShellProps {
  photo: string;
  headline: ReactNode;
  blurb: string;
  cardTitle: string;
  cardSub: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthShell({ photo, headline, blurb, cardTitle, cardSub, children, footer }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-pine-950 text-white">
      <motion.img
        src={photo}
        alt=""
        initial={{ scale: 1.15 }}
        animate={{ scale: 1.03 }}
        transition={{ duration: 2.6, ease }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#16394a]/70 via-[#16394a]/50 to-pine-950/90" />
      <div className="pointer-events-none absolute inset-2 rounded-[2rem] border-2 border-white/25 sm:rounded-[2.75rem]" />

      <Link to="/" className="absolute left-8 top-8 z-20 flex items-center gap-2 sm:left-12 sm:top-10">
        <RavenMark className="h-6 w-6 text-gold-400" />
        <span className="font-brand text-lg">Raven's Trail</span>
      </Link>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-28 sm:px-12 lg:grid-cols-[1fr_26rem]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="hidden lg:block"
        >
          <h1 className="font-body text-7xl font-light leading-[0.95] tracking-tight">{headline}</h1>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/70">{blurb}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-2xl"
        >
          <h2 className="text-3xl font-light">{cardTitle}</h2>
          <p className="mt-1 text-sm text-white/65">{cardSub}</p>
          <div className="mt-7">{children}</div>
          <p className="mt-6 text-center text-sm text-white/65">{footer}</p>
        </motion.div>
      </div>
    </div>
  );
}

export function AuthField({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-white/80">{label}</span>
      <input
        {...props}
        className="auth-input w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition-colors duration-200 ease-smooth placeholder:text-white/35 focus:border-gold-400"
      />
    </label>
  );
}

export function AuthError({ message }: { message: string }) {
  return <p className="rounded-xl border border-clay-500/40 bg-clay-600/25 px-4 py-2.5 text-sm text-clay-100">{message}</p>;
}
