import { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import clsx from "clsx";
import BookingsTab from "../components/profile/BookingsTab";
import OverviewTab from "../components/profile/OverviewTab";
import ProfileHeader from "../components/profile/ProfileHeader";
import ReviewsTab from "../components/profile/ReviewsTab";
import SettingsTab from "../components/profile/SettingsTab";
import TripsPanel from "../components/profile/TripsPanel";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { useTrails } from "../hooks/useTrails";
import { bookingsApi, reviewsApi, tripsApi } from "../lib/api";
import { profileStats } from "../lib/profile";

const TABS = ["overview", "bookings", "trips", "reviews", "settings"] as const;
type TabId = (typeof TABS)[number];
const LABELS: Record<TabId, string> = { overview: "Overview", bookings: "Bookings", trips: "Trips", reviews: "Reviews", settings: "Settings" };

export default function Profile() {
  const { user, token, loading } = useAuth();
  const [params, setParams] = useSearchParams();
  const trips = useFetch(() => tripsApi.list(token!), [token]);
  const bookings = useFetch(() => bookingsApi.list(token!), [token]);
  const reviews = useFetch(() => reviewsApi.mine(token!), [token]);
  const { data: allTrails } = useTrails();

  const tripList = useMemo(() => trips.data ?? [], [trips.data]);
  const bookingList = useMemo(() => bookings.data ?? [], [bookings.data]);
  const reviewList = useMemo(() => reviews.data ?? [], [reviews.data]);
  const stats = useMemo(() => profileStats(tripList, bookingList, reviewList), [tripList, bookingList, reviewList]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: "/profile" }} replace />;

  const requested = params.get("tab");
  const tab: TabId = TABS.find((t) => t === requested) ?? "overview";
  const go = (id: string) => setParams({ tab: id }, { replace: true });
  const counts: Partial<Record<TabId, number>> = { bookings: bookingList.length, reviews: reviewList.length };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-28">
      <ProfileHeader user={user} stats={stats} />

      <nav aria-label="Profile sections" className="mt-8 flex gap-1 overflow-x-auto border-b border-ink-900/10 [scrollbar-width:none]">
        {TABS.map((id) => (
          <button
            key={id}
            onClick={() => go(id)}
            aria-current={tab === id ? "page" : undefined}
            className={clsx(
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors duration-200",
              tab === id ? "text-forest-700" : "text-ink-700/70 hover:text-ink-900"
            )}
          >
            {LABELS[id]}
            {counts[id] ? <span className="ml-1.5 rounded-full bg-ink-900/8 px-1.5 py-0.5 text-xs text-ink-700">{counts[id]}</span> : null}
            {tab === id && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-forest-600" />}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" && <OverviewTab trips={tripList} bookings={bookingList} reviews={reviewList} stats={stats} totalTrails={allTrails?.length ?? 0} onGo={go} />}
        {tab === "bookings" && <BookingsTab bookings={bookingList} loading={bookings.loading} error={bookings.error} />}
        {tab === "trips" && <TripsPanel trips={tripList} loading={trips.loading} error={trips.error} onChanged={trips.refetch} />}
        {tab === "reviews" && <ReviewsTab reviews={reviewList} loading={reviews.loading} error={reviews.error} />}
        {tab === "settings" && <SettingsTab user={user} />}
      </div>
    </div>
  );
}
