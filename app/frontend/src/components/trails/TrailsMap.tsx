import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet";
import { Link } from "react-router-dom";
import type { Trail, ParkingSpot } from "../../types";

const trailIcon = divIcon({
  className: "",
  html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:#b5502f;border:2px solid #f4f0e3;box-shadow:0 1px 4px rgba(14,28,21,0.4)"></span>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const parkingIcon = divIcon({
  className: "",
  html: `<span style="display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:5px;background:#2f5233;border:2px solid #f4f0e3;box-shadow:0 1px 4px rgba(14,28,21,0.4);color:#f4f0e3;font-size:10px;font-weight:700;font-family:sans-serif">P</span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface TrailsMapProps {
  trails: Trail[];
  parking?: ParkingSpot[];
  center?: [number, number];
  zoom?: number;
}

export default function TrailsMap({ trails, parking = [], center, zoom }: TrailsMapProps) {
  const singleFocus = trails.length === 1 && parking.length === 0;
  const mapCenter = center ?? (singleFocus ? trails[0].startPoint : [7.4, 80.8]);
  const mapZoom = zoom ?? (singleFocus ? 12 : 8);

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={false}
      className="isolate h-full w-full" // own stacking context, so Leaflet's z-indexes (up to 1000) can't paint over dropdowns
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {trails.map((t) => (
        <Marker key={t.id} position={t.startPoint} icon={trailIcon}>
          <Popup>
            <div className="font-body">
              <p className="font-medium text-sm">{t.name}</p>
              <p className="text-xs text-ink-700/70">
                {t.district} · {t.peakElevationM} m
              </p>
              <Link to={`/trails/${t.slug}`} className="text-xs text-clay-600 font-medium">
                View trail
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
      {parking.map((p) => (
        <Marker key={p.id} position={p.coords} icon={parkingIcon}>
          <Popup>
            <div className="font-body">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-ink-700/70">
                LKR {p.pricePerDay}/day · {p.secured ? "Secured" : "Unsecured"}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
