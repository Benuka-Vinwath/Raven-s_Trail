import { Link, useParams, useSearchParams } from "react-router-dom";
import { Mountain, Clock, Ruler, Star, TrendingUp, Calendar, ArrowLeft, Tent, SquareParking, CloudSun, Wallet, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { useTrail } from "../hooks/useTrails";
import { useTrailReviews } from "../hooks/useReviews";
import { trailPhoto } from "../lib/photos";
import Avatar from "../components/ui/Avatar";
import DifficultyTag from "../components/ui/DifficultyTag";
import ElevationSparkline from "../components/ui/ElevationSparkline";
import GearShopsPanel from "../components/trails/GearShopsPanel";
import ParkingPanel from "../components/trails/ParkingPanel";
import WeatherPanel from "../components/trails/WeatherPanel";
import BudgetCalculator from "../components/budget/BudgetCalculator";
import NotFound from "./NotFound";

const TABS = [
  { id: "gear", label: "Gear & rentals", icon: Tent },
  { id: "parking", label: "Parking", icon: SquareParking },
  { id: "weather", label: "Weather", icon: CloudSun },
  { id: "budget", label: "Budget", icon: Wallet },
  { id: "reviews", label: "Trip reports", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TrailDetail() {
  const { slug } = useParams();
  const { data: trail, loading, error } = useTrail(slug ?? "");
  const { data: trailReviews, loading: reviewsLoading } = useTrailReviews(slug ?? "");
  const [params, setParams] = useSearchParams();

  if (error) return <NotFound />;

  if (loading || !trail) {
    return <p className="max-w-6xl mx-auto px-5 py-20 text-center text-sm text-ink-700/60">Loading trail…</p>;
  }

  const activeTab = (params.get("tab") as TabId) ?? "gear";
  const tab = TABS.some((t) => t.id === activeTab) ? activeTab : "gear";

  function setTab(id: TabId) {
    setParams({ tab: id }, { replace: true });
  }

  return (
    <div>
      <div className="h-80 sm:h-[26rem] relative -mt-[4.25rem]">
        <div className="pointer-events-none absolute inset-2 z-10 rounded-[2rem] border-2 border-white/25 sm:rounded-[2.75rem]" />
        <img src={trailPhoto(trail.slug, 1800)} alt={trail.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-950/80 via-pine-950/20 to-pine-950/30" />
        <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-5 pb-6 w-full">
          <Link
            to="/trails"
            className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors duration-200 ease-smooth"
          >
            <ArrowLeft size={15} />
            All trails
          </Link>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl text-white">{trail.name}</h1>
          <p className="text-white/85 mt-1">
            {trail.district} · {trail.region}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-6xl mx-auto px-5 py-10"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat icon={Mountain} label="Peak elevation" value={`${trail.peakElevationM} m`} />
          <Stat icon={Ruler} label="Distance" value={`${trail.distanceKm} km`} />
          <Stat icon={Clock} label="Duration" value={`${trail.durationHrs}h`} />
          <Stat icon={TrendingUp} label="Elevation gain" value={`${trail.elevationGainM} m`} />
        </div>

        <div className="mt-8 flex items-center gap-4 flex-wrap">
          <DifficultyTag difficulty={trail.difficulty} />
          <span className="flex items-center gap-1 text-sm text-ink-700">
            <Star size={14} className="fill-gold-500 text-gold-500" />
            {trail.rating} ({trail.reviewCount} reviews)
          </span>
          <span className="flex items-center gap-1.5 text-sm text-ink-700">
            <Calendar size={14} />
            Best {trail.bestSeason}
          </span>
        </div>

        <p className="mt-6 max-w-3xl text-ink-700/85 leading-relaxed">{trail.description}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {trail.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-forest-600/10 text-forest-700 font-medium transition-colors duration-200 ease-smooth hover:bg-forest-600/20"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-8 border border-ink-900/10 rounded-2xl p-6 max-w-3xl">
          <h2 className="font-medium text-ink-900">Elevation profile</h2>
          <ElevationSparkline profile={trail.elevationProfile} className="mt-4 w-full h-24" />
          <div className="mt-2 flex justify-between text-xs text-ink-700/60">
            <span>Trailhead</span>
            <span>{trail.peakElevationM} m summit</span>
          </div>
        </div>

        {/* Planning hub */}
        <div className="mt-14">
          <h2 className="font-display text-2xl text-ink-900">Plan this hike</h2>
          <p className="mt-1 text-sm text-ink-700/70">
            Everything for {trail.name} in one place — gear, parking, weather and budget.
          </p>

          <div className="mt-6 border-b border-ink-900/10 flex gap-6 overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
            {TABS.map((t) => {
              const isActive = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={clsx(
                    "relative flex items-center gap-2 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200 ease-smooth",
                    isActive ? "text-clay-600" : "text-ink-700/70 hover:text-ink-900"
                  )}
                >
                  <t.icon size={16} />
                  {t.label}
                  {isActive && (
                    <motion.span
                      layoutId="trail-tab-underline"
                      className="absolute left-0 right-0 bottom-0 h-[2px] bg-clay-600 rounded-full"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8"
          >
            {tab === "gear" && <GearShopsPanel trail={trail} />}
            {tab === "parking" && <ParkingPanel trail={trail} />}
            {tab === "weather" && <WeatherPanel trail={trail} />}
            {tab === "budget" && <BudgetCalculator key={trail.id} trail={trail} />}
            {tab === "reviews" && <ReviewsPanel reviews={trailReviews ?? []} loading={reviewsLoading} />}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Mountain; label: string; value: string }) {
  return (
    <div className="border border-ink-900/10 rounded-2xl p-4 hover:border-forest-500/40 hover:shadow-elevate reveal hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 ease-smooth">
      <Icon size={18} className="text-forest-600" />
      <p className="mt-2 font-display text-xl text-ink-900">{value}</p>
      <p className="text-xs text-ink-700/60">{label}</p>
    </div>
  );
}

function ReviewsPanel({ reviews, loading }: { reviews: { id: string; author: string; avatarUrl: string | null; rating: number; date: string; text: string }[]; loading: boolean }) {
  if (loading) return <p className="text-sm text-ink-700/60">Loading trip reports…</p>;

  if (reviews.length === 0) {
    return (
      <div className="border border-dashed border-ink-900/20 rounded-2xl p-8 text-center max-w-3xl">
        <p className="text-ink-900 font-medium">No reviews yet</p>
        <p className="mt-1 text-sm text-ink-700/70">Be the first to hike and report back.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-5">
      {reviews.map((r) => (
        <div key={r.id} className="reveal border-b border-ink-900/10 pb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar name={r.author} src={r.avatarUrl} className="h-7 w-7 text-xs" />
              <p className="font-medium text-ink-900 text-sm">{r.author}</p>
            </div>
            <div className="flex items-center gap-1 text-sm text-ink-700">
              <Star size={13} className="fill-gold-500 text-gold-500" />
              {r.rating}
            </div>
          </div>
          <p className="text-xs text-ink-700/50 mt-0.5">{r.date}</p>
          <p className="mt-2 text-sm text-ink-700/85 leading-relaxed">{r.text}</p>
        </div>
      ))}
    </div>
  );
}
