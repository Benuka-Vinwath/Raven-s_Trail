import { useMemo, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  MapPin,
  Tent,
  SquareParking,
  Map as MapIcon,
  Wallet,
  CloudSun,
  Images,
  ArrowRight,
  ArrowUpRight,
  Star,
} from "lucide-react";
import Avatar from "../components/ui/Avatar";
import Button from "../components/ui/Button";
import CountUp from "../components/ui/CountUp";
import Reveal from "../components/ui/Reveal";
import PhotoMarquee from "../components/ui/PhotoMarquee";
import SectionHeading from "../components/ui/SectionHeading";
import TrailCard from "../components/trails/TrailCard";
import { Link } from "react-router-dom";
import { useTrails } from "../hooks/useTrails";
import { useGearShops } from "../hooks/useGearShops";
import { useParkingSpots } from "../hooks/useParkingSpots";
import { useRecentReviews } from "../hooks/useReviews";
import { useAuth } from "../context/AuthContext";
import { heroPhoto } from "../lib/photos";

const FEATURES = [
  { icon: MapPin, title: "Hiking locations", body: "Search trails by district, elevation and difficulty across the island." },
  { icon: Tent, title: "Equipment rental", body: "Reserve tents, packs and camping gear from partners near your trailhead." },
  { icon: SquareParking, title: "Parking", body: "Find secure vehicle parking near the trailhead, with pricing up front." },
  { icon: MapIcon, title: "Offline maps", body: "Download GPX routes before you lose signal on the ridge." },
  { icon: Wallet, title: "Budget planner", body: "Estimate transport, food and rental costs before you commit to a hike." },
  { icon: CloudSun, title: "Live weather", body: "Rain, wind and temperature forecasts pulled for your exact trailhead." },
  { icon: Images, title: "Photos & reviews", body: "Real trip reports and condition notes from hikers who went before you." },
];

const ease = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  const { user } = useAuth();
  const { data: trails } = useTrails();
  const { data: gearShops } = useGearShops();
  const { data: parkingSpots } = useParkingSpots();
  const { data: recentReviews } = useRecentReviews(2);

  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const featured = useMemo(
    () => [...(trails ?? [])].sort((a, b) => b.rating - a.rating).slice(0, 3),
    [trails]
  );
  const top = featured[0];
  const reviewTotal = (trails ?? []).reduce((sum, t) => sum + t.reviewCount, 0);
  const rated = (trails ?? []).filter((t) => t.reviewCount > 0);
  const avgRating = rated.length ? rated.reduce((sum, t) => sum + t.rating, 0) / rated.length : 0;
  const districtCount = new Set((trails ?? []).map((t) => t.district)).size;
  const gearItemCount = (gearShops ?? []).reduce((sum, shop) => sum + shop.items.length, 0);

  const stats = [
    { icon: MapPin, value: (trails ?? []).length, label: "Trails mapped" },
    { icon: MapIcon, value: districtCount, label: "Districts covered" },
    { icon: Tent, value: gearItemCount, label: "Gear items to rent" },
    { icon: SquareParking, value: (parkingSpots ?? []).length, label: "Parking sites" },
  ];

  return (
    <>
      {/* Hero */}
      <section ref={hero} className="relative -mt-[4.5rem] min-h-[100svh] overflow-hidden bg-pine-950 text-white">
        <motion.img
          src={heroPhoto()}
          alt="Mist rolling through a Sri Lankan hill forest"
          style={{ y: bgY }}
          className="absolute inset-x-0 -top-1/4 h-[125%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#16394a]/70 via-[#16394a]/45 to-pine-950/85" />
        <div className="pointer-events-none absolute inset-2 rounded-[2rem] border-2 border-white/25 sm:rounded-[2.75rem]" />

        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col px-8 pb-14 pt-32 sm:px-12"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease }}
            className="font-body text-[3.4rem] font-light leading-[0.95] tracking-tight sm:text-7xl lg:text-[7rem]"
          >
            Sri Lanka's
            <br />
            <span className="text-white/45">Wildest</span>
            <br />
            Trails
          </motion.h1>

          <div className="mt-auto grid items-end gap-8 pt-12 lg:grid-cols-[1fr_auto_23rem]">
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease }}
              className="max-w-[17rem] text-sm leading-relaxed text-white/75"
            >
              Discover handpicked hiking routes across the hill country. Book gear, park safely and plan your
              budget before you ever lace up.
            </motion.p>

            {trails && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.45, ease }}
                className="lg:pb-1"
              >
                <p className="flex items-center gap-2 text-4xl font-light">
                  <Star size={22} className="fill-gold-400 text-gold-400" />
                  {avgRating.toFixed(1)}
                </p>
                <p className="mt-1 text-sm text-white/75">from {reviewTotal.toLocaleString()}+ hiker reviews</p>
              </motion.div>
            )}

            {top && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.55, ease }}
                className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/60">Top rated · {top.district}</p>
                    <h2 className="mt-1 text-2xl font-light leading-snug">{top.name}</h2>
                  </div>
                  <Link
                    to={`/trails/${top.slug}`}
                    aria-label={`Open ${top.name}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-white/25"
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-black/20 px-3 py-2.5">
                    <p className="text-xs text-white/50">Peak</p>
                    {top.peakElevationM} m
                  </div>
                  <div className="rounded-xl bg-black/20 px-3 py-2.5">
                    <p className="text-xs text-white/50">Best season</p>
                    {top.bestSeason}
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between">
                  <p className="text-3xl font-light">
                    {top.distanceKm} km<span className="text-base text-white/60"> / {top.durationHrs}h</span>
                  </p>
                  <p className="text-sm capitalize text-white/75">{top.difficulty}</p>
                </div>
                <Button to={`/trails/${top.slug}`} variant="light" className="mt-5 w-full">
                  Plan this hike
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      {trails && gearShops && parkingSpots && (
        <section className="bg-pine-950 pt-20">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-6 sm:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1}>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <s.icon size={20} className="text-gold-400" />
                  <dt className="mt-6 font-body text-6xl font-light text-white">
                    <CountUp to={s.value} />
                  </dt>
                  <dd className="mt-1 text-sm text-white/60">{s.label}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      <PhotoMarquee />

      {/* Core features */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <Reveal>
          <SectionHeading
            eyebrow="What's inside"
            title="Everything a hike in Sri Lanka actually needs"
            description="Hikers currently stitch together maps, forums, rental shops and weather apps by hand. Raven's Trail puts the whole journey in one place."
          />
        </Reveal>

        <div className="mt-12 grid md:grid-cols-2">
          {FEATURES.map((f, i) => {
            const lastRow = Math.floor(i / 2) === Math.floor((FEATURES.length - 1) / 2);
            const leftCol = i % 2 === 0;
            return (
              <Reveal
                key={f.title}
                delay={(i % 2) * 0.1}
                className={`group flex gap-4 border-ink-900/10 py-6 transition-colors duration-300 ease-smooth hover:bg-forest-600/5 md:px-7 md:py-7 ${
                  leftCol ? "md:border-r" : ""
                } ${lastRow ? "" : "border-b"}`}
              >
                <f.icon
                  size={22}
                  className="mt-0.5 shrink-0 text-clay-600 transition-transform duration-300 ease-smooth group-hover:-rotate-6 group-hover:scale-110"
                />
                <div>
                  <h3 className="font-medium text-ink-900">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-700/75">{f.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Trail explorer teaser */}
      {featured.length > 0 && (
        <section className="border-y border-ink-900/10 bg-parchment-100/50">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow="Top rated" title="Start with a trail hikers keep coming back to" />
              <Button to="/trails" variant="ghost" size="sm">
                View all trails
                <ArrowRight size={15} />
              </Button>
            </Reveal>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.12}>
                  <TrailCard trail={t} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community teaser */}
      {recentReviews && recentReviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-24">
          <Reveal>
            <SectionHeading eyebrow="From the community" title="Trip reports from hikers on the ground" />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {recentReviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.12}>
                <div className="rounded-3xl border border-ink-900/10 bg-parchment-100/40 p-6 transition-[border-color,box-shadow,transform] duration-300 ease-smooth hover:-translate-y-1 hover:border-forest-500/40 hover:shadow-elevate">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar name={r.author} src={r.avatarUrl} className="h-8 w-8 text-xs" />
                      <p className="font-medium text-ink-900">{r.author}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-ink-700">
                      <Star size={14} className="fill-gold-500 text-gold-500" />
                      {r.rating}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-700/60">{r.trailName}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700/85">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative overflow-hidden bg-pine-950">
        <img src={heroPhoto(1600)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        <Reveal className="relative mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-24 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-3xl text-parchment-50 sm:text-4xl">
              {user ? "Ready for your next summit?" : "Ready to plan your next summit?"}
            </h2>
            <p className="mt-2 max-w-md text-mist-100/75">
              {user
                ? "Browse trails, book gear and plan your budget for your next hike."
                : "Create a free account to save trails, track your rentals and plan your hiking budget."}
            </p>
          </div>
          <Button to={user ? "/trails" : "/signup"} variant="light" size="md">
            {user ? "Explore trails" : "Get started"}
            <ArrowRight size={16} />
          </Button>
        </Reveal>
      </section>
    </>
  );
}
