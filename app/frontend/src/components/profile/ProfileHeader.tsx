import { useRef, useState } from "react";
import { Camera, Mail, Phone } from "lucide-react";
import RavenMark from "../icons/RavenMark";
import Avatar from "../ui/Avatar";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import { resizeToDataUrl } from "../../lib/image";
import type { ProfileStats } from "../../lib/profile";
import type { User } from "../../types";

const STAT_LABELS: { key: keyof ProfileStats; label: string; unit?: string }[] = [
  { key: "trails", label: "Trails done" },
  { key: "km", label: "Distance", unit: " km" },
  { key: "climb", label: "Climbed", unit: " m" },
  { key: "bookings", label: "Bookings" },
  { key: "reviews", label: "Reviews" },
];

// Who you are at a glance: branded banner, avatar (tap the camera to change it), contact line and the numbers from your hikes.
export default function ProfileHeader({ user, stats }: { user: User; stats: ProfileStats }) {
  const { updateProfile } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await updateProfile({ avatarUrl: await resizeToDataUrl(file) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const since = new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <header className="overflow-hidden rounded-3xl border border-ink-900/10 bg-parchment-50 shadow-elevate">
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-forest-600/25 via-forest-500/10 to-gold-100 sm:h-52">
        {/* contour lines, like a trail map */}
        <svg viewBox="0 0 800 200" preserveAspectRatio="xMaxYMid slice" className="absolute inset-0 h-full w-full text-forest-700/35" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
          {[40, 75, 110, 145, 180, 215].map((r, i) => (
            <ellipse key={r} cx="610" cy="120" rx={r * 1.6} ry={r * 0.7} transform={`rotate(${-12 + i * 2} 610 120)`} />
          ))}
        </svg>
        <div className="relative flex items-center gap-3 px-6 pt-5 sm:px-8 sm:pt-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-600 text-parchment-50 shadow-md">
            <RavenMark className="h-6 w-6" />
          </span>
          <div className="leading-tight">
            <p className="font-brand text-xl text-ink-900">Raven's Trail</p>
            <p className="text-xs text-ink-700/70">Sri Lanka's hiking companion</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 sm:px-8">
        <div className="-mt-14 flex flex-wrap items-end gap-5 sm:-mt-16">
          <div className="relative">
            <Avatar name={user.name} src={user.avatarUrl} className="h-28 w-28 text-4xl ring-4 ring-parchment-50 sm:h-32 sm:w-32" />
            <button
              onClick={() => input.current?.click()}
              disabled={busy}
              aria-label="Change profile photo"
              title="Change photo"
              className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 text-white shadow-md ring-2 ring-parchment-50 transition-transform hover:scale-110 disabled:opacity-60"
            >
              <Camera size={16} />
            </button>
            <input ref={input} type="file" accept="image/*" className="sr-only" onChange={onFile} />
          </div>

          <div className="min-w-0 pb-1">
            <h1 className="truncate font-display text-3xl text-ink-900 sm:text-4xl">{user.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-700/80">
              <span className="flex items-center gap-1.5">
                <Mail size={14} className="text-forest-600" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-forest-600" />
                  {user.phone}
                </span>
              )}
              <span>Member since {since}</span>
            </p>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-clay-700">{error}</p>}

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STAT_LABELS.map((s) => (
            <div key={s.key} className="rounded-2xl border border-ink-900/10 bg-parchment-100/60 px-4 py-3">
              <dd className="font-display text-2xl text-ink-900">
                {stats[s.key].toLocaleString()}
                <span className="text-base text-ink-700/60">{s.unit}</span>
              </dd>
              <dt className="text-xs text-ink-700/70">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </header>
  );
}
