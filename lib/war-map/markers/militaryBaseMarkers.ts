import maplibregl from "maplibre-gl";
import type { MilitaryBase } from "@/types/militaryBase";
import type { Country } from "@/types/countries";
import { buildSVGMarkerElement } from "@/lib/maps/svgMarkerUtils";
import {MilitaryBaseType} from "@/types/militaryBase";

const SHAPE_CLIP_PATHS: Record<string, string> = {
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
  diamond: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  star: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
};

type MarkerShape = "square" | "circle" | "triangle" | "diamond" | "star";

const MILITARY_BASE_STYLE: Record<
  string,
  { color: string; shape: MarkerShape; svgPath?: string }
> = {
  "Ground Base": { color: "#3b82f6", shape: "square" },
  "Naval Base": { color: "#0ea5e9", shape: "circle", svgPath: "/icons/anchor-icon.svg" },
  "Air Base": { color: "#8b5cf6", shape: "circle", svgPath: "/icons/airport.svg" },
  "Missile Base": { color: "#ef4444", shape: "diamond" },
  "Major Base": { color: "#eab308", shape: "star" },
  "Logistics Base": { color: "#a54100", shape: "square", svgPath: "/icons/wooden-crate.svg" },
  Other: { color: "#6b7280", shape: "circle" },
};

const MARKER_SIZE = 14;
const BORDER_WIDTH = 2;

function buildMarkerElement(color: string, shape: MarkerShape): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "location-marker military-base-marker";
  const borderRadius = shape === "circle" ? "50%" : "0";
  el.style.cssText = `
    width: ${MARKER_SIZE}px; height: ${MARKER_SIZE}px; border-radius: ${borderRadius};
    background-color: ${color}; border: ${BORDER_WIDTH}px solid rgba(255,255,255,0.8);
    cursor: pointer; box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  `;
  return el;
}

function formatCountries(base: MilitaryBase): string {
  return (
    [base.operator_country]
      ?.map((country: Country) => `${country.name} ${country.emoji}`)
      .join(", ") ?? ""
  );
}

export async function createMilitaryBaseMarker(
  base: MilitaryBase,
  map: maplibregl.Map
): Promise<maplibregl.Marker | null> {
  if (!base?.geom?.coordinates?.[0] || !base?.geom?.coordinates?.[1]) return null;
  const style = MILITARY_BASE_STYLE[base.type_now ?? "Other"] ?? MILITARY_BASE_STYLE.Other;
  const el =
    style.svgPath
      ? await buildSVGMarkerElement(style.color, style.svgPath, "location-marker military-base-marker military-base-marker--naval")
      : buildMarkerElement(style.color, style.shape);
  el.title = base.name;

  const popup = new maplibregl.Popup({ offset: 12, className: "map-popup-dark" }).setHTML(
    `<div style="min-width: 180px; font-family: system-ui, sans-serif;">
      <strong style="font-size: 14px;">${base.id}</strong>
      <strong style="font-size: 14px;">${base.name}</strong>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px; font-style: italic;">${base.type_now}</div>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px;">${formatCountries(base)}</div>
    </div>`
  );

  return new maplibregl.Marker({ element: el })
    .setLngLat([base.geom.coordinates[0], base.geom.coordinates[1]])
    .setPopup(popup)
    .addTo(map);
}
