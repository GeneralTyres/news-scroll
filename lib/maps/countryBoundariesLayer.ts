import type { FeatureCollection } from "geojson";
import maplibregl from "maplibre-gl";

/** Default IDs — importers can pass alternatives for multiple country layers on one map. */
export const COUNTRY_BOUNDARIES_SOURCE_ID = "countries-boundaries";

export function countryBoundariesFillLayerId(sourceId: string): string {
  return `${sourceId}-fill`;
}

export function countryBoundariesLineLayerId(sourceId: string): string {
  return `${sourceId}-line`;
}

/**
 * Add GeoJSON source + fill + line once. Safe to call multiple times.
 */
export function ensureCountryBoundaryLayers(
  map: maplibregl.Map,
  sourceId: string = COUNTRY_BOUNDARIES_SOURCE_ID
): void {
  if (map.getSource(sourceId)) return;

  map.addSource(sourceId, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: countryBoundariesFillLayerId(sourceId),
    type: "fill",
    source: sourceId,
    paint: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.22,
    },
  });

  map.addLayer({
    id: countryBoundariesLineLayerId(sourceId),
    type: "line",
    source: sourceId,
    paint: {
      "line-color": "#60a5fa",
      "line-width": 1,
    },
  });
}

export function setCountryBoundariesData(
  map: maplibregl.Map,
  data: FeatureCollection,
  sourceId: string = COUNTRY_BOUNDARIES_SOURCE_ID
): void {
  const src = map.getSource(sourceId) as maplibregl.GeoJSONSource | undefined;
  if (src) src.setData(data);
}

export type CountryPolygonClickHandler = (countryId: number) => void;

export interface CountryBoundaryClickBindings {
  offClick: () => void;
  offMouseEnter: () => void;
  offMouseLeave: () => void;
}

/**
 * Wire click + pointer cursor on country fill layer. Call after `ensureCountryBoundaryLayers` + style loaded.
 */
export function bindCountryBoundaryClick(
  map: maplibregl.Map,
  onCountryClick: CountryPolygonClickHandler,
  sourceId: string = COUNTRY_BOUNDARIES_SOURCE_ID
): CountryBoundaryClickBindings {
  const fillId = countryBoundariesFillLayerId(sourceId);

  const onClick = (e: maplibregl.MapLayerMouseEvent) => {
    const feat = e.features?.[0];
    const raw = feat?.properties?.id;
    let id: number;
    if (typeof raw === "number") id = raw;
    else if (typeof raw === "string") id = Number.parseInt(raw, 10);
    else id = Number.NaN;
    if (!Number.isFinite(id)) return;
    onCountryClick(id);
  };

  const onEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const onLeave = () => {
    map.getCanvas().style.cursor = "";
  };

  map.on("click", fillId, onClick);
  map.on("mouseenter", fillId, onEnter);
  map.on("mouseleave", fillId, onLeave);

  return {
    offClick: () => map.off("click", fillId, onClick),
    offMouseEnter: () => map.off("mouseenter", fillId, onEnter),
    offMouseLeave: () => map.off("mouseleave", fillId, onLeave),
  };
}
