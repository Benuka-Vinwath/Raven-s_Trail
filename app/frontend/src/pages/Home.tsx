import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  Tent,
  SquareParking,
  Map as MapIcon,
  Wallet,
  CloudSun,
  Images,
  ArrowRight,
  Search,
  Star,
} from "lucide-react";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import RidgeIllustration from "../components/illustrations/RidgeIllustration";
import TrailCard from "../components/trails/TrailCard";
import { useTrails } from "../hooks/useTrails";
import { useGearShops } from "../hooks/useGearShops";
import { useParkingSpots } from "../hooks/useParkingSpots";
import { useRecentReviews } from "../hooks/useReviews";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  { icon: MapPin, title: "Hiking locations", body: "Search trails by district, elevation and difficulty across the island." },
  { icon: Tent, title: "Equipment rental", body: "Reserve tents, packs and camping gear from partners near your trailhead." },
  { icon: SquareParking, title: "Parking", body: "Find secure vehicle parking near the trailhead, with pricing up front." },
  { icon: MapIcon, title: "Offline maps", body: "Download GPX routes before you lose signal on the ridge." },
  { icon: Wallet, title: "Budget planner", body: "Estimate transport, food and rental costs before you commit to a hike." },
  { icon: CloudSun, title: "Live weather", body: "Rain, wind and temperature forecasts pulled for your exact trailhead." },
  { icon: Images, title: "Photos & reviews", body: "Real trip reports and condition notes from hikers who went before you." },
];

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const heroItem = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: trails } = useTrails();
  const { data: gearShops } = useGearShops();
  const { data: parkingSpots } = useParkingSpots();
  const { data: recentReviews } = useRecentReviews(2);

  const featured = useMemo(
    () => [...(trails ?? [])].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [trails]
  );
  const districtCount = new Set((trails ?? []).map((t) => t.district)).size;
  const gearItemCount = (gearShops ?? []).reduce((sum, shop) => sum + shop.items.length, 0);

  const stats = [
    { value: String((trails ?? []).length), label: "Trails mapped" },
    { value: String(districtCount), label: "Districts covered" },
    { value: String(gearItemCount), label: "Gear rentals" },
    { value: String((parkingSpots ?? []).length), label: "Parking sites" },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(query ? `/trails?q=${encodeURIComponent(query)}` : "/trails");
  }

  return (
    <>
      {/* Hero */}
      <section className="contour-bg border-b border-ink-900/10">
        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto px-5 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <motion.h1
              variants={heroItem}
              className="font-display text-[2.75rem] sm:text-6xl leading-[1.05] text-ink-900"
            >
              Sri Lanka's hiking companion, from trailhead to summit.
            </motion.h1>
            <motion.p variants={heroItem} className="mt-6 text-lg text-ink-700/85 leading-relaxed max-w-lg">
              Plan routes, book gear, track weather and budget — one trail-tested app for every hike on the
              island, built for the way Sri Lanka's trails actually work.
            </motion.p>

            <motion.form
              variants={heroItem}
              onSubmit={handleSearch}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-lg"
            >
              <label className="relative flex-1">
                <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-700/50" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="text"
                  placeholder="Search trails, e.g. Ella or Knuckles"
                  className="w-full pl-10 pr-4 py-3 rounded border border-ink-900/15 bg-parchment-50 text-ink-900 placeholder:text-ink-700/40 outline-none transition-colors duration-200 ease-smooth focus:border-forest-500"
                />
              </label>
              <Button type="submit" size="md" className="shrink-0">
                Explore trails
                <ArrowRight size={16} />
              </Button>
            </motion.form>

            <motion.dl variants={heroItem} className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-2xl text-forest-700">{s.value}</dt>
                  <dd className="text-sm text-ink-700/70">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.div
            variants={heroItem}
            className="rounded overflow-hidden border border-ink-900/10 shadow-elevate"
          >
            <RidgeIllustration variant="dawn" className="w-full h-[22rem] object-cover" />
          </motion.div>
        </motion.div>
      </section>

      {/* Core features */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <SectionHeading
          eyebrow="What's inside"
          title="Everything a hike in Sri Lanka actually needs"
          description="Hikers currently stitch together maps, forums, rental shops and weather apps by hand. Raven's Trail puts the whole journey in one place."
        />

        <div className="mt-12 grid md:grid-cols-2">
          {FEATURES.map((f, i) => {
            const lastRow = Math.floor(i / 2) === Math.floor((FEATURES.length - 1) / 2);
            const leftCol = i % 2 === 0;
            return (
              <div
                key={f.title}
                className={`group flex gap-4 py-6 md:py-7 md:px-7 border-ink-900/10 transition-colors duration-300 ease-smooth hover:bg-forest-600/5 ${
                  leftCol ? "md:border-r" : ""
                } ${lastRow ? "" : "border-b"}`}
              >
                <f.icon
                  size={22}
                  className="text-clay-600 shrink-0 mt-0.5 transition-transform duration-300 ease-smooth group-hover:scale-110 group-hover:-rotate-6"
                />
                <div>
                  <h3 className="font-medium text-ink-900">{f.title}</h3>
                  <p className="mt-1 text-sm text-ink-700/75 leading-relaxed">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trail explorer teaser */}
      {featured.length > 0 && (
        <section className="bg-parchment-100/50 border-y border-ink-900/10">
          <div className="max-w-6xl mx-auto px-5 py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Top rated" title="Start with a trail hikers keep coming back to" />
              <Button to="/trails" variant="ghost" size="sm">
                View all trails
                <ArrowRight size={15} />
              </Button>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((t) => (
                <TrailCard key={t.id} trail={t} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community teaser */}
      {recentReviews && recentReviews.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 py-20">
          <SectionHeading eyebrow="From the community" title="Trip reports from hikers on the ground" />
          <div className="mt-10 grid sm:grid-cols-2 gap-6">
            {recentReviews.map((r) => (
              <div
                key={r.id}
                className="border border-ink-900/10 rounded p-6 bg-parchment-100/40 hover:border-forest-500/40 hover:shadow-elevate hover:-translate-y-1 transition-[border-color,box-shadow,transform] duration-300 ease-smooth"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink-900">{r.author}</p>
                  <div className="flex items-center gap-1 text-sm text-ink-700">
                    <Star size={14} className="fill-gold-500 text-gold-500" />
                    {r.rating}
                  </div>
                </div>
                <p className="text-xs text-ink-700/60 mt-0.5">{r.trailName}</p>
                <p className="mt-3 text-sm text-ink-700/85 leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-pine-950">
        <div className="max-w-6xl mx-auto px-5 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl text-parchment-50">
              {user ? "Ready for your next summit?" : "Ready to plan your next summit?"}
            </h2>
            <p className="mt-2 text-mist-100/70 max-w-md">
              {user
                ? "Browse trails, book gear and plan your budget for your next hike."
                : "Create a free account to save trails, track your rentals and plan your hiking budget."}
            </p>
          </div>
          {user ? (
            <Button to="/trails" size="md">
              Explore trails
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button to="/signup" size="md">
              Get started
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </section>
    </>
  );
}
