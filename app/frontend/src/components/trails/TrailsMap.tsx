import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { AttributionControl, CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L, { divIcon, latLngBounds, type LatLngBounds, type Map as LeafletMap } from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import { Link } from "react-router-dom";
import { Navigation, Search, Star, X } from "lucide-react";
import clsx from "clsx";
import DifficultyTag from "../ui/DifficultyTag";
import { DIFFICULTY_COLOR, directionsUrl } from "../../lib/geo";
import { trailPhoto } from "../../lib/photos";
import type { ParkingSpot, Trail } from "../../types";

// All three are free without a key. The standard OpenStreetMap server is fine for development and light use, but its
// usage policy doesn't allow heavy or commercial traffic: before launch, switch to a provider with a key or your own tiles.
// (CARTO's free raster tiles used to work here and now return an "API key required" watermark.)
const BASEMAPS = [
  {
    id: "map",
    label: "Map",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "",
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    id: "terrain",
    label: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    maxZoom: 17,
    attribution: 'Map data &copy; OpenStreetMap contributors, SRTM | Style &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    subdomains: "",
    maxZoom: 18,
    attribution: "Tiles &copy; Esri, Maxar, Earthstar Geographics",
  },
] as const;

function trailIcon(difficulty: Trail["difficulty"], active: boolean) {
  const size = active ? 26 : 18;
  const shadow = active ? "0 0 0 3px rgba(47,82,51,.55),0 3px 10px rgba(14,28,21,.5)" : "0 1px 5px rgba(14,28,21,.45)";
  return divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${DIFFICULTY_COLOR[difficulty]};border:3px solid #fff;box-shadow:${shadow};transition:all .15s"></span>`,
  });
}

const parkingIcon = divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;background:#2f5233;border:2px solid #f4f0e3;box-shadow:0 1px 4px rgba(14,28,21,0.4);color:#f4f0e3;font-size:10px;font-weight:700;font-family:sans-serif">P</span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ---- logic-only children: they need the map object (useMap) and draw nothing themselves ----

// Trail pins, clustered where they overlap. Highlights follow hover and selection from outside the map.
function TrailMarkers({ trails, hoveredSlug, selected, onPick }: { trails: Trail[]; hoveredSlug: string | null; selected: string | null; onPick: (slug: string) => void }) {
  const map = useMap();
  const group = useRef<L.MarkerClusterGroup | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  const pick = useRef(onPick);
  useEffect(() => {
    pick.current = onPick;
  }, [onPick]);

  // rebuilt only when the set of trails changes, not on every render
  const key = trails.map((t) => t.id).join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stable = useMemo(() => trails, [key]);

  useEffect(() => {
    const g = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 42,
      iconCreateFunction: (cluster) =>
        divIcon({
          className: "",
          iconSize: [38, 38],
          html: `<span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#2f5233;color:#f4f0e3;font:600 13px sans-serif;border:3px solid #f4f0e3;box-shadow:0 2px 8px rgba(14,28,21,.45)">${cluster.getChildCount()}</span>`,
        }),
    });
    const bySlug = new Map<string, L.Marker>();
    for (const t of stable) {
      const m = L.marker(t.startPoint, { icon: trailIcon(t.difficulty, false), title: t.name, alt: t.name });
      m.on("click", () => pick.current(t.slug));
      g.addLayer(m);
      bySlug.set(t.slug, m);
    }
    map.addLayer(g);
    group.current = g;
    markers.current = bySlug;
    return () => {
      map.removeLayer(g);
      group.current = null;
      markers.current = new Map();
    };
  }, [map, stable]);

  useEffect(() => {
    for (const t of stable) {
      const m = markers.current.get(t.slug);
      if (!m) continue;
      const active = t.slug === selected || t.slug === hoveredSlug;
      m.setIcon(trailIcon(t.difficulty, active));
      m.setZIndexOffset(active ? 1000 : 0);
    }
  }, [stable, hoveredSlug, selected]);

  // choosing a trail (from the list or a pin) opens any cluster hiding it and moves the map there
  useEffect(() => {
    if (!selected) return;
    const m = markers.current.get(selected);
    const g = group.current;
    if (!m || !g) return;
    g.zoomToShowLayer(m, () => map.flyTo(m.getLatLng(), Math.max(map.getZoom(), 11), { duration: 0.6 }));
  }, [selected, map]);

  return null;
}

// frames whatever is being shown whenever the set of points changes (e.g. after filtering)
function FitView({ points, enabled }: { points: [number, number][]; enabled: boolean }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (!enabled || points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 11);
    else map.fitBounds(latLngBounds(points), { padding: [48, 48], maxZoom: 11, animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, map]);
  return null;
}

// hands the map to the parent, keeps it sized when its box changes (list/map toggle), reports real user pans and zooms,
// and only lets the scroll wheel zoom while Ctrl/Cmd is held so the page can still scroll past the map
function MapBridge({ mapRef, onUserMoved, onWheelHint }: { mapRef: MutableRefObject<LeafletMap | null>; onUserMoved: () => void; onWheelHint: () => void }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    const el = map.getContainer();
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(el);

    let user = false;
    const flag = () => {
      user = true;
    };
    const events = ["mousedown", "touchstart", "dblclick", "keydown"] as const;
    events.forEach((ev) => el.addEventListener(ev, flag, { passive: true }));
    // a plain scroll over the map is the page scrolling, not the map moving; only Ctrl/Cmd+scroll zooms it
    const wheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) flag();
      else onWheelHint();
    };
    el.addEventListener("wheel", wheel, { passive: true });
    const moved = () => {
      if (user) {
        user = false;
        onUserMoved();
      }
    };
    map.on("moveend", moved);

    const down = (e: KeyboardEvent) => (e.key === "Control" || e.key === "Meta") && map.scrollWheelZoom.enable();
    const up = (e: KeyboardEvent) => (e.key === "Control" || e.key === "Meta") && map.scrollWheelZoom.disable();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      resize.disconnect();
      events.forEach((ev) => el.removeEventListener(ev, flag));
      el.removeEventListener("wheel", wheel);
      map.off("moveend", moved);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [map, mapRef, onUserMoved, onWheelHint]);
  return null;
}

interface TrailsMapProps {
  trails: Trail[];
  parking?: ParkingSpot[];
  center?: [number, number];
  zoom?: number;
  /** "full" adds the legend and "search this area"; "compact" is for small embedded maps */
  variant?: "full" | "compact";
  hoveredSlug?: string | null;
  /** when onSelect is given the parent owns the selection; otherwise the map keeps its own */
  selectedSlug?: string | null;
  onSelect?: (slug: string | null) => void;
  userPos?: [number, number] | null;
  userDistances?: Record<string, number>;
  autoFit?: boolean;
  onSearchArea?: (bounds: LatLngBounds) => void;
}

export default function TrailsMap({
  trails,
  parking = [],
  center,
  zoom,
  variant = "compact",
  hoveredSlug = null,
  selectedSlug = null,
  onSelect,
  userPos = null,
  userDistances,
  autoFit = true,
  onSearchArea,
}: TrailsMapProps) {
  const [baseId, setBaseId] = useState<(typeof BASEMAPS)[number]["id"]>("map");
  const [moved, setMoved] = useState(false);
  const [hint, setHint] = useState(false);
  const [inner, setInner] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const hintTimer = useRef<number | undefined>(undefined);
  const base = BASEMAPS.find((b) => b.id === baseId)!;

  const controlled = onSelect !== undefined;
  const selected = controlled ? selectedSlug : inner;
  const select = (slug: string | null) => (controlled ? onSelect(slug) : setInner(slug));
  const picked = trails.find((t) => t.slug === selected) ?? null;

  // frame the trails (and parking) unless the page gave an explicit centre or turned fitting off
  const fitPoints = useMemo(
    () => [...trails.map((t) => t.startPoint as [number, number]), ...parking.map((p) => p.coords as [number, number])],
    [trails, parking]
  );
  const singleFocus = trails.length === 1 && parking.length === 0;
  const mapCenter: [number, number] = center ?? (singleFocus ? trails[0].startPoint : [7.4, 80.8]);
  const mapZoom = zoom ?? (singleFocus ? 12 : 8);

  const flashHint = useCallback(() => {
    setHint(true);
    window.clearTimeout(hintTimer.current);
    hintTimer.current = window.setTimeout(() => setHint(false), 1400);
  }, []);
  const markMoved = useCallback(() => setMoved(true), []);

  useEffect(() => {
    if (userPos && mapRef.current) mapRef.current.flyTo(userPos, 9, { duration: 0.8 });
  }, [userPos]);

  const userKm = picked && userDistances ? userDistances[picked.slug] : undefined;

  return (
    <div className="relative h-full w-full">
      <MapContainer center={mapCenter} zoom={mapZoom} scrollWheelZoom={false} className="isolate h-full w-full" attributionControl={false}>
        {/* subdomains must be left out (not undefined) when a style has none, or Leaflet loses its default and crashes */}
        <TileLayer key={base.id} url={base.url} attribution={base.attribution} maxZoom={base.maxZoom} {...(base.subdomains ? { subdomains: base.subdomains } : {})} />
        <AttributionControl position="bottomright" prefix={false} />
        <MapBridge mapRef={mapRef} onUserMoved={markMoved} onWheelHint={flashHint} />
        <FitView points={fitPoints} enabled={autoFit && center === undefined} />
        <TrailMarkers trails={trails} hoveredSlug={hoveredSlug} selected={selected} onPick={select} />
        {parking.map((p) => (
          <Marker key={p.id} position={p.coords} icon={parkingIcon}>
            <Popup>
              <div className="font-body">
                <p className="text-sm font-medium">{p.name}</p>
                <p className="text-xs text-ink-700/70">
                  LKR {p.pricePerDay}/day · {p.secured ? "Secured" : "Unsecured"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
        {userPos && <CircleMarker center={userPos} radius={8} pathOptions={{ color: "#fff", weight: 3, fillColor: "#2563eb", fillOpacity: 1 }} />}
      </MapContainer>

      {/* everything below sits outside the map element, so dragging or scrolling over it never moves the map */}
      <div className="absolute right-3 top-3 z-[1000] flex overflow-hidden rounded-xl border border-ink-900/10 bg-parchment-50/95 text-xs shadow-sm backdrop-blur">
        {BASEMAPS.map((b) => (
          <button
            key={b.id}
            onClick={() => setBaseId(b.id)}
            aria-pressed={b.id === baseId}
            className={clsx("px-2.5 py-1.5 transition-colors", b.id === baseId ? "bg-forest-600 text-parchment-50" : "text-ink-700 hover:bg-forest-600/10")}
          >
            {b.label}
          </button>
        ))}
      </div>

      {hint && (
        <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-ink-900/25">
          <p className="rounded-xl bg-ink-900/80 px-4 py-2 text-sm text-white">Hold Ctrl (⌘ on Mac) and scroll to zoom</p>
        </div>
      )}

      {variant === "full" && onSearchArea && moved && (
        <button
          onClick={() => {
            if (mapRef.current) onSearchArea(mapRef.current.getBounds());
            setMoved(false);
          }}
          className="absolute left-1/2 top-3 z-[1000] flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-forest-600 px-4 py-2 text-sm font-medium text-parchment-50 shadow-elevate transition-transform hover:scale-105"
        >
          <Search size={14} /> Search this area
        </button>
      )}

      {variant === "full" && !picked && trails.length > 1 && (
        <div className="absolute bottom-6 left-3 z-[1000] flex items-center gap-3 rounded-xl border border-ink-900/10 bg-parchment-50/95 px-3 py-1.5 text-xs text-ink-700 shadow-sm backdrop-blur">
          {(["easy", "moderate", "hard"] as const).map((d) => (
            <span key={d} className="flex items-center gap-1.5 capitalize">
              <span className="h-2.5 w-2.5 rounded-full border border-white" style={{ background: DIFFICULTY_COLOR[d] }} />
              {d}
            </span>
          ))}
        </div>
      )}

      {picked && (
        <div className="absolute inset-x-3 bottom-6 z-[1000] max-w-sm overflow-hidden rounded-2xl border border-ink-900/10 bg-parchment-50 shadow-elevate">
          <div className="flex">
            <img src={trailPhoto(picked.slug, 300)} alt="" className="w-24 shrink-0 object-cover" />
            <div className="min-w-0 flex-1 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display leading-snug text-ink-900">{picked.name}</p>
                <button onClick={() => select(null)} aria-label="Close" className="shrink-0 text-ink-700/50 hover:text-ink-900">
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-ink-700/70">
                {picked.district}
                {userKm !== undefined ? ` · about ${Math.round(userKm)} km from you` : ""}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-700">
                <DifficultyTag difficulty={picked.difficulty} />
                <span>{picked.distanceKm} km</span>
                <span>{picked.durationHrs} h</span>
                {picked.reviewCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Star size={11} className="fill-gold-500 text-gold-500" />
                    {picked.rating}
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-4 text-xs">
                <Link to={`/trails/${picked.slug}`} className="font-medium text-clay-600">
                  View trail
                </Link>
                <a href={directionsUrl(picked.startPoint)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-forest-700">
                  <Navigation size={12} /> Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
