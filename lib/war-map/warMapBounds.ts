import maplibregl from "maplibre-gl";

export interface LngLatLike {
  lng: number;
  lat: number;
}

/** Fit map to points. No-op if 0 or 1 point. */
export function fitMapToPoints(
  map: maplibregl.Map,
  points: LngLatLike[],
  options: { padding?: number; maxZoom?: number } = {}
): void {
  const { padding = 50, maxZoom = 8 } = options;
  const valid = points.filter((p) => p != null && typeof p.lat === "number" && typeof p.lng === "number");
  if (valid.length > 1) {
    const bounds = new maplibregl.LngLatBounds();
    for (const p of valid) bounds.extend([p.lng, p.lat]);
    map.fitBounds(bounds, { padding, maxZoom });
  } else if (valid.length === 1) {
    map.setCenter([valid[0].lng, valid[0].lat]);
    map.setZoom(6);
  }
}
