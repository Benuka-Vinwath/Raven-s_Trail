import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mountain, Clock, Star } from "lucide-react";
import type { Trail } from "../../types";
import { trailPhoto } from "../../lib/photos";
import DifficultyTag from "../ui/DifficultyTag";

const MotionLink = motion.create(Link);

// awayKm is the straight-line distance from the visitor, shown after they tap "Near me"
export default function TrailCard({ trail, awayKm }: { trail: Trail; awayKm?: number }) {
  return (
    <MotionLink
      to={`/trails/${trail.slug}`}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="group block bg-parchment-100/60 border border-ink-900/10 hover:border-forest-500/40 hover:shadow-elevate transition-[border-color,box-shadow] duration-300 ease-smooth rounded-3xl overflow-hidden"
      whileHover={{ y: -6 }}
      whileTap={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={trailPhoto(trail.slug)}
          alt={trail.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-700 ease-smooth"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="bg-parchment-50/90 backdrop-blur px-2.5 py-1 rounded-2xl text-xs font-medium text-ink-900">{trail.district}</span>
          {awayKm !== undefined && (
            <span className="bg-forest-600/90 backdrop-blur px-2.5 py-1 rounded-2xl text-xs font-medium text-parchment-50">about {Math.round(awayKm)} km away</span>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg text-ink-900 leading-snug">{trail.name}</h3>
          <div className="flex items-center gap-1 text-sm text-ink-700 shrink-0 mt-1">
            {trail.reviewCount > 0 ? (
              <>
                <Star size={14} className="fill-gold-500 text-gold-500" />
                {trail.rating}
              </>
            ) : (
              <span className="text-xs font-medium text-forest-700">New</span>
            )}
          </div>
        </div>

        <p className="mt-1.5 text-sm text-ink-700/75 line-clamp-2 leading-relaxed">{trail.summary}</p>

        <div className="mt-4 flex items-center justify-between text-sm text-ink-700/80">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Mountain size={15} className="text-forest-600" />
              {trail.peakElevationM} m
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-forest-600" />
              {trail.durationHrs}h
            </span>
          </div>
          <DifficultyTag difficulty={trail.difficulty} />
        </div>
      </div>
    </MotionLink>
  );
}
