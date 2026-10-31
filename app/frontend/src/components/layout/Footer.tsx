import { Link } from "react-router-dom";
import RavenMark from "../icons/RavenMark";
import { heroPhoto } from "../../lib/photos";

const COLUMNS = [
  {
    heading: "Plan",
    links: [
      { to: "/trails", label: "Trail explorer" },
      { to: "/budget", label: "Budget planner" },
      { to: "/weather", label: "Weather" },
    ],
  },
  {
    heading: "Gear up",
    links: [
      { to: "/rentals", label: "Equipment rental" },
      { to: "/parking", label: "Parking" },
    ],
  },
  {
    heading: "Community",
    links: [
      { to: "/community", label: "Photos & reviews" },
      { to: "/signup", label: "Join Raven's Trail" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="print:hidden relative overflow-hidden border-t border-white/10 bg-pine-950 text-mist-100">
      <img src={heroPhoto(1600)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-pine-950/70 to-pine-950/95" />
      <div className="relative max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <RavenMark className="h-6 w-6 text-gold-400" />
            <span className="font-brand text-lg text-parchment-50">Raven's Trail</span>
          </div>
          <p className="mt-3 text-sm text-mist-100/70 leading-relaxed max-w-xs">
            One trail-tested companion for hiking Sri Lanka — routes, gear, parking, weather and budget in a
            single map.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-sm font-medium text-parchment-50">{col.heading}</p>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-mist-100/70 hover:text-parchment-50 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="relative border-t border-parchment-50/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-mist-100/50">
          <p>© 2026 Raven's Trail. Built for hikers, not algorithms.</p>
          <p>Made in Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
