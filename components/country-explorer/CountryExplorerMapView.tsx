"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import type {
  CircleLayerSpecification,
  GeoJSONSourceSpecification,
  SymbolLayerSpecification,
} from "@maplibre/maplibre-gl-style-spec";
import { createMapInContainer } from "@/lib/maps/maplibreBootstrap";
import {
  bindCountryBoundaryClick,
  ensureCountryBoundaryLayers,
  setCountryBoundariesData,
} from "@/lib/maps/countryBoundariesLayer";
import {
  buildExplorerPointPopupHtml,
  EMPTY_POINT_COLLECTION,
  militaryBasesToPointCollection,
  powerPlantsToPointCollection,
  type ExplorerPointFeature,
} from "@/lib/maps/locationMarkersSync";
import { fitMapToPoints, type LngLatLike } from "@/lib/maps/fitMapToPoints";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";

export interface CountryExplorerMapViewProps {
  boundaryFeatureCollection: FeatureCollection;
  militaryBases: MilitaryBase[];
  powerPlants: PowerPlant[];
  onCountryPick: (countryId: number) => void;
  /** When set, after markers load, fit map to marker extents (e.g. selected country id). */
  fitToMarkersKey: number | null;
}

const MILITARY_SOURCE_ID = "country-explorer-military";
const POWER_SOURCE_ID = "country-explorer-power";
const MILITARY_LAYER_ID = "country-explorer-military-points";
const POWER_LAYER_ID = "country-explorer-power-points";
const POWER_PLANT_SPRITE_ID = "power-plant-svg";
const POWER_PLANT_SVG_URL = "/icons/power-plant.svg";

function toGeoJsonSource(source: maplibregl.Source | undefined): maplibregl.GeoJSONSource | null {
  if (!source) return null;
  const candidate = source as maplibregl.GeoJSONSource;
  if (typeof candidate.setData !== "function") return null;
  return candidate;
}

async function ensurePowerPlantSprite(map: maplibregl.Map): Promise<void> {
  if (map.hasImage(POWER_PLANT_SPRITE_ID)) return;

  try {
    const loaded = await map.loadImage(POWER_PLANT_SVG_URL);
    if (!map.hasImage(POWER_PLANT_SPRITE_ID)) {
      // MapLibre expects either ImageData or an HTMLImageElement depending on build/version.
      const loadedAny = loaded as unknown as { data?: unknown };
      const candidate = loadedAny.data ?? loaded;
      map.addImage(POWER_PLANT_SPRITE_ID, candidate as any);
    }
  } catch (err) {
    console.warn("Failed to load power-plant sprite image", err);
  }
}

function ensurePointSourcesAndLayers(map: maplibregl.Map): void {
  if (!map.getSource(MILITARY_SOURCE_ID)) {
    map.addSource(MILITARY_SOURCE_ID, {
      type: "geojson",
      data: EMPTY_POINT_COLLECTION,
      maxzoom: 12,
    });
  }

  if (!map.getLayer(MILITARY_LAYER_ID)) {
    map.addLayer({
      id: MILITARY_LAYER_ID,
      type: "circle",
      source: MILITARY_SOURCE_ID,
      minzoom: 2,
      paint: {
        "circle-color": ["coalesce", ["get", "color"], "#3b82f6"],
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 2, 4, 6, 8, 10, 12],
        "circle-stroke-color": "rgba(102, 102, 102, 0.85)",
        "circle-stroke-width": 2,
      },
    });
  }

  if (!map.getSource(POWER_SOURCE_ID)) {
    const sourceConfig: GeoJSONSourceSpecification = {
      type: "geojson",
      data: EMPTY_POINT_COLLECTION,
      maxzoom: 12,
    };

    map.addSource(POWER_SOURCE_ID, sourceConfig);
  }

  if (!map.getLayer(POWER_LAYER_ID)) {
    if (map.hasImage(POWER_PLANT_SPRITE_ID)) {
          // const layerConfig: CircleLayerSpecification = {
          //   id: POWER_LAYER_ID,
          //   type: "circle",
          //   source: POWER_SOURCE_ID,
          //   minzoom: 3,
          //   paint: {
          //     "circle-color": ["coalesce", ["get", "color"], "#facc15"],
          //     "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2, 6, 3, 10, 5],
          //     "circle-stroke-color": "rgba(255,255,255,0.85)",
          //     "circle-stroke-width": 1,
          //   },
          // };
      const layerConfig: SymbolLayerSpecification = {
        id: POWER_LAYER_ID,
        type: "symbol",
        source: POWER_SOURCE_ID,
        minzoom: 3,
        layout: {
          "icon-image": POWER_PLANT_SPRITE_ID,
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
        paint: {
          "icon-color": ["coalesce", ["get", "color"], "#facc15"],
          "text-color": ["coalesce", ["get", "color"], "#000000"],
        },
      };

      map.addLayer(layerConfig);
    } else {
      // Fallback if the sprite image fails to load.
      const layerConfig: CircleLayerSpecification = {
        id: POWER_LAYER_ID,
        type: "circle",
        source: POWER_SOURCE_ID,
        minzoom: 3,
        paint: {
          "circle-color": ["coalesce", ["get", "color"], "#facc15"],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 3, 2, 6, 4, 10, 8, 14, 10],
          "circle-stroke-color": "rgba(187, 168, 0, 0.85)",
          "circle-stroke-width": 1,
        },
      };

      map.addLayer(layerConfig);
    }
  }
}

export function CountryExplorerMapView({
  boundaryFeatureCollection,
  militaryBases,
  powerPlants,
  onCountryPick,
  fitToMarkersKey,
}: Readonly<CountryExplorerMapViewProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onPickRef = useRef(onCountryPick);
  const boundaryRef = useRef(boundaryFeatureCollection);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    onPickRef.current = onCountryPick;
  }, [onCountryPick]);

  useEffect(() => {
    boundaryRef.current = boundaryFeatureCollection;
  }, [boundaryFeatureCollection]);

  const [mapReady, setMapReady] = useState(false);

  // Create map once; on load add country polygons + click handler.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = createMapInContainer(el, {
      // style: "https://tiles.openfreemap.org/styles/bright",
    });
    mapRef.current = map;

    const onLoad = async () => {
      // Ensure the symbol sprite exists before creating the power-plant layer.
      await ensurePowerPlantSprite(map);

      ensureCountryBoundaryLayers(map);
      ensurePointSourcesAndLayers(map);
      bindCountryBoundaryClick(map, (id) => onPickRef.current(id));
      setCountryBoundariesData(map, boundaryRef.current);

      const onPointClick = (e: maplibregl.MapLayerMouseEvent) => {
        const feature = e.features?.[0] as unknown as ExplorerPointFeature | undefined;
        if (!feature?.geometry?.coordinates) return;
        const [lng, lat] = feature.geometry.coordinates;
        if (lng == null || lat == null) return;
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({ offset: 12, className: "map-popup-dark" })
          .setLngLat([lng, lat])
          .setHTML(buildExplorerPointPopupHtml(feature.properties))
          .addTo(map);
      };

      map.on("click", MILITARY_LAYER_ID, onPointClick);
      map.on("click", POWER_LAYER_ID, onPointClick);
      setMapReady(true);
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      setMapReady(false);
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync GeoJSON when selection removes polygons.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    ensureCountryBoundaryLayers(map);
    setCountryBoundariesData(map, boundaryFeatureCollection);
  }, [boundaryFeatureCollection, mapReady]);

  // Markers + optional fit to new country's points.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;

    ensurePointSourcesAndLayers(map);
    const militarySource = toGeoJsonSource(map.getSource(MILITARY_SOURCE_ID));
    const powerSource = toGeoJsonSource(map.getSource(POWER_SOURCE_ID));
    if (!militarySource || !powerSource) return;

    militarySource.setData(militaryBasesToPointCollection(militaryBases));
    powerSource.setData(powerPlantsToPointCollection(powerPlants));

    if (fitToMarkersKey != null && (militaryBases.length > 0 || powerPlants.length > 0)) {
      const points: LngLatLike[] = [
        ...militaryBases
          .filter((b) => b.geom?.coordinates?.[0] != null && b.geom?.coordinates?.[1] != null)
          .map((b) => ({ lng: b.geom.coordinates[0], lat: b.geom.coordinates[1] })),
        ...powerPlants
          .filter((p) => p.geom?.coordinates?.[0] != null && p.geom?.coordinates?.[1] != null)
          .map((p) => ({ lng: p.geom.coordinates[0], lat: p.geom.coordinates[1] })),
      ];
      fitMapToPoints(map, points, { maxZoom: 8 });
    }
  }, [mapReady, militaryBases, powerPlants, fitToMarkersKey]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "100vh" }}
    />
  );
}
