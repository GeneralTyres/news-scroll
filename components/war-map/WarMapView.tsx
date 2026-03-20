"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { WorldEvent } from "@/types/warEvent";
import type { MilitaryBase } from "@/types/militaryBase";
import { createEventMarker } from "@/lib/maps/mapMarkersHelper.service";
import { createMapInContainer } from "@/lib/maps/maplibreBootstrap";
import { createMilitaryAndPowerPlantMarkers } from "@/lib/maps/locationMarkersSync";
import { fitMapToPoints, type LngLatLike } from "@/lib/war-map/warMapBounds";
import type { PowerPlant } from "@/types/powerPlants";

export interface MapViewApi {
  map: maplibregl.Map;
  flyToEvent: (event: WorldEvent) => void;
}

interface MapViewProps {
  events: WorldEvent[];
  militaryBases: MilitaryBase[];
  powerPlants: PowerPlant[];
  onMapReady?: (api: MapViewApi) => void;
}

export function MapView({ events, militaryBases, powerPlants, onMapReady }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const eventMarkersRef = useRef<maplibregl.Marker[]>([]);
  const locationMarkersRef = useRef<maplibregl.Marker[]>([]);
  const eventMarkerByIdRef = useRef<Map<string, maplibregl.Marker>>(new Map());
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
      for (const m of eventMarkersRef.current) m.remove();
      for (const m of locationMarkersRef.current) m.remove();
      eventMarkersRef.current = [];
      locationMarkersRef.current = [];
      eventMarkerByIdRef.current.clear();
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
      for (const m of eventMarkerByIdRef.current.values()) {
        const popup = m.getPopup();
        if (popup?.isOpen()) popup.remove();
      }
      map.flyTo({
        center: [ev.location.lng, ev.location.lat],
        zoom: 6,
        duration: 800,
      });
      const target = eventMarkerByIdRef.current.get(ev.id);
      if (target) target.togglePopup();
    };

    // Remove old markers
    for (const m of eventMarkersRef.current) m.remove();
    for (const m of locationMarkersRef.current) m.remove();
    eventMarkersRef.current = [];
    locationMarkersRef.current = [];
    eventMarkerByIdRef.current.clear();

    (async () => {
      // Add location markers first (below), then event markers (on top)
      const locationMarkers = await createMilitaryAndPowerPlantMarkers(
        map,
        { militaryBases, powerPlants },
        () => cancelled
      );
      if (cancelled) return;
      locationMarkersRef.current = locationMarkers;

      const eventMarkers: maplibregl.Marker[] = [];
      for (const event of events) {
        const marker = createEventMarker(event, map);
        eventMarkers.push(marker);
        eventMarkerByIdRef.current.set(event.id, marker);
      }
      eventMarkersRef.current = eventMarkers;

      if (!initialFitDoneRef.current) {
        const points: LngLatLike[] = [
          ...events.map((e) => ({ lng: e.geom?.coordinates?.[0] ?? 0, lat: e.geom?.coordinates?.[1] ?? 0 })),
          ...militaryBases.filter((b) => b.geom?.coordinates?.[0] != null && b.geom?.coordinates?.[1] != null).map((b) => ({ lng: b.geom?.coordinates?.[0] ?? 0, lat: b.geom?.coordinates?.[1] ?? 0 })),
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
  }, [events, militaryBases, powerPlants]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ minHeight: "100vh" }}
    />
  );
}
