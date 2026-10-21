import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { pagePhoto } from "../../lib/photos";

const ease = [0.22, 1, 0.36, 1] as const;

interface PageHeroProps {
  page: Parameters<typeof pagePhoto>[0];
  title: string;
  dim?: string;
  blurb: ReactNode;
  children?: ReactNode;
}

// Same look as the home hero (photo, tinted overlay, rounded-2xl frame, light headline), shorter, tucked under the navbar.
export default function PageHero({ page, title, dim, blurb, children }: PageHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative -mt-[4.5rem] mb-12 overflow-hidden bg-pine-950 text-white">
      <motion.img
        src={pagePhoto(page)}
        alt=""
        style={{ y: bgY }}
        className="absolute inset-x-0 -top-1/4 h-[125%] w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#16394a]/80 via-[#16394a]/65 to-pine-950/90" />
      <div className="pointer-events-none absolute inset-2 rounded-[2rem] border-2 border-white/25 sm:rounded-[2.75rem]" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 mx-auto max-w-6xl px-8 pb-16 pt-40 sm:px-12 sm:pb-20 sm:pt-44"
      >
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease }}
          className="font-body text-[2.75rem] font-light leading-[1] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {title}
          {dim && <span className="text-white/45"> {dim}</span>}
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease }}
          className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base"
        >
          {blurb}
        </motion.div>
        {children && <div className="mt-8">{children}</div>}
      </motion.div>
    </section>
  );
}
