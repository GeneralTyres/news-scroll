import maplibregl from "maplibre-gl";

export interface LngLatLike {
  lng: number;
  lat: number;
}

export interface FitMapToPointsOptions {
  maxZoom?: number;
  padding?: number;
}

/**
 * Fit the map viewport to the bounding box of the given points.
 */
export function fitMapToPoints(
  map: maplibregl.Map,
  points: LngLatLike[],
  options: FitMapToPointsOptions = {}
): void {
  if (points.length === 0) return;
  const bounds = new maplibregl.LngLatBounds();
  for (const p of points) {
    bounds.extend([p.lng, p.lat]);
  }
  map.fitBounds(bounds, {
    padding: options.padding ?? 40,
    maxZoom: options.maxZoom,
  });
}
