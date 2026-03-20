"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import { createMapInContainer } from "@/lib/maps/maplibreBootstrap";
import {
  bindCountryBoundaryClick,
  ensureCountryBoundaryLayers,
  setCountryBoundariesData,
} from "@/lib/maps/countryBoundariesLayer";
import { createMilitaryAndPowerPlantMarkers } from "@/lib/maps/locationMarkersSync";
import { fitMapToPoints, type LngLatLike } from "@/lib/war-map/warMapBounds";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";
import { log } from "console";

export interface CountryExplorerMapViewProps {
  boundaryFeatureCollection: FeatureCollection;
  militaryBases: MilitaryBase[];
  powerPlants: PowerPlant[];
  onCountryPick: (countryId: number) => void;
  /** When set, after markers load, fit map to marker extents (e.g. selected country id). */
  fitToMarkersKey: number | null;
}

export function CountryExplorerMapView({
  boundaryFeatureCollection,
  militaryBases,
  powerPlants,
  onCountryPick,
  fitToMarkersKey,
}: CountryExplorerMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onPickRef = useRef(onCountryPick);
  const boundaryRef = useRef(boundaryFeatureCollection);

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
      style: "https://tiles.openfreemap.org/styles/bright",
    });
    mapRef.current = map;

    const onLoad = () => {
      ensureCountryBoundaryLayers(map);
      bindCountryBoundaryClick(map, (id) => onPickRef.current(id));
      setCountryBoundariesData(map, boundaryRef.current);
      setMapReady(true);
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      setMapReady(false);
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
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

    let cancelled = false;
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    void (async () => {
      const markers = await createMilitaryAndPowerPlantMarkers(
        map,
        { militaryBases, powerPlants },
        () => cancelled
      );
      if (cancelled) return;
      markersRef.current = markers;

      console.log('markers', markers);

      if (
        fitToMarkersKey != null &&
        (militaryBases.length > 0 || powerPlants.length > 0)
      ) {
        const points: LngLatLike[] = [
          ...militaryBases
            .filter((b) => b.geom?.coordinates?.[0] != null && b.geom?.coordinates?.[1] != null)
            .map((b) => ({ lng: b.geom!.coordinates[0], lat: b.geom!.coordinates[1] })),
          ...powerPlants
            .filter((p) => p.geom?.coordinates?.[0] != null && p.geom?.coordinates?.[1] != null)
            .map((p) => ({ lng: p.geom!.coordinates[0], lat: p.geom!.coordinates[1] })),
        ];
        fitMapToPoints(map, points, { maxZoom: 8 });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapReady, militaryBases, powerPlants, fitToMarkersKey]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "100vh" }}
    />
  );
}
