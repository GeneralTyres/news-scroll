"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection } from "geojson";
import { createMapInContainer } from "@/lib/maps/maplibreBootstrap";
import {
  bindCountryBoundaryClick,
  countryBoundariesFillLayerId,
  ensureCountryBoundaryLayers,
  setCountryBoundariesData,
} from "@/lib/maps/countryBoundariesLayer";

const SOURCE_ID = "boundaries-explorer";

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export interface BoundariesExplorerMapViewProps {
  features: FeatureCollection;
  onPolygonClick: (id: number) => void;
}

export function BoundariesExplorerMapView({
  features,
  onPolygonClick,
}: Readonly<BoundariesExplorerMapViewProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const featuresRef = useRef<FeatureCollection>(features);
  const onClickRef = useRef(onPolygonClick);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onClickRef.current = onPolygonClick;
  }, [onPolygonClick]);

  useEffect(() => {
    featuresRef.current = features;
  }, [features]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = createMapInContainer(el);
    mapRef.current = map;

    const fillId = countryBoundariesFillLayerId(SOURCE_ID);

    const onLoad = () => {
      ensureCountryBoundaryLayers(map, SOURCE_ID);
      setCountryBoundariesData(map, featuresRef.current, SOURCE_ID);
      bindCountryBoundaryClick(map, (id) => onClickRef.current(id), SOURCE_ID);

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: "map-popup-dark",
      });
      popupRef.current = popup;

      const onMove = (e: maplibregl.MapLayerMouseEvent) => {
        const feat = e.features?.[0];
        const name = feat?.properties?.name;
        const label =
          typeof name === "string" ? name : name != null ? String(name) : "Unknown";
        popup.setLngLat(e.lngLat).setHTML(`<div style="padding:2px 6px;font-size:12px;">${escapeHtml(label)}</div>`).addTo(map);
      };

      const onLeave = () => {
        popup.remove();
      };

      map.on("mousemove", fillId, onMove);
      map.on("mouseleave", fillId, onLeave);

      setMapReady(true);
    };

    map.on("load", onLoad);

    return () => {
      map.off("load", onLoad);
      popupRef.current?.remove();
      popupRef.current = null;
      setMapReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;

    const applyData = () => {
      ensureCountryBoundaryLayers(map, SOURCE_ID);
      setCountryBoundariesData(map, features, SOURCE_ID);
    };

    const styleOk = map.isStyleLoaded();

    if (styleOk) {
      applyData();
      return;
    }
    map.once("idle", applyData);
    return () => {
      map.off("idle", applyData);
    };
  }, [features, mapReady]);

  return <div ref={containerRef} className="h-full w-full" style={{ minHeight: "100vh" }} />;
}
