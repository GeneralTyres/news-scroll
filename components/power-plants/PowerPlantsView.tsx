"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { WorldEvent } from "@/types/warEvent";
import { createMapInContainer } from "@/lib/maps/maplibreBootstrap";
import { createMilitaryAndPowerPlantMarkers } from "@/lib/maps/locationMarkersSync";
import { fitMapToPoints, type LngLatLike } from "@/lib/war-map/warMapBounds";
import type { PowerPlant } from "@/types/powerPlants";

export interface MapViewApi {
  map: maplibregl.Map;
  flyToEvent: (event: WorldEvent) => void;
}

interface PowerPlantsViewProps {
  powerPlants: PowerPlant[];
  onMapReady?: (api: MapViewApi) => void;
}

export function PowerPlantsView({ powerPlants, onMapReady }: PowerPlantsViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const powerPlantMarkersRef = useRef<maplibregl.Marker[]>([]);
  const powerPlantMarkerByIdRef = useRef<Map<string, maplibregl.Marker>>(new Map());
  const initialFitDoneRef = useRef(false);
  const onMapReadyRef = useRef(onMapReady);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  // Create map once on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = createMapInContainer(mapContainerRef.current);
    mapRef.current = map;

    return () => {
      for (const m of powerPlantMarkersRef.current) m.remove();
      powerPlantMarkersRef.current = [];
      powerPlantMarkerByIdRef.current.clear();
      map.remove();
      mapRef.current = null;
      initialFitDoneRef.current = false;
    };
  }, []);

  // Sync markers when data changes; do not move map. Initial fit + onMapReady only once.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let cancelled = false;

    const flyToEvent = (ev: WorldEvent) => {
      for (const m of powerPlantMarkerByIdRef.current.values()) {
        const popup = m.getPopup();
        if (popup?.isOpen()) popup.remove();
      }
      map.flyTo({
        center: [ev.location.lng, ev.location.lat],
        zoom: 6,
        duration: 800,
      });
      const target = powerPlantMarkerByIdRef.current.get(ev.id);
      if (target) target.togglePopup();
    };

    // Remove old markers
    for (const m of powerPlantMarkersRef.current) m.remove();
    powerPlantMarkersRef.current = [];
    powerPlantMarkerByIdRef.current.clear();

    (async () => {
      const powerPlantMarkers = await createMilitaryAndPowerPlantMarkers(
        map,
        { powerPlants },
        () => cancelled
      );
      if (cancelled) return;
      powerPlantMarkersRef.current = powerPlantMarkers;

      if (!initialFitDoneRef.current) {
        const points: LngLatLike[] = [
          ...powerPlants.filter((p) => p.geom?.coordinates?.[0] != null && p.geom?.coordinates?.[1] != null).map((p) => ({ lng: p.geom?.coordinates?.[0] ?? 0, lat: p.geom?.coordinates?.[1] ?? 0 })),
        ];
        fitMapToPoints(map, points);
        initialFitDoneRef.current = true;
        onMapReadyRef.current?.({ map, flyToEvent });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [powerPlants]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ minHeight: "100vh" }}
    />
  );
}
