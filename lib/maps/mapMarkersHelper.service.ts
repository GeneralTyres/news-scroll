import maplibregl from "maplibre-gl";
import type { WorldEvent } from "@/types/warEvent";
import type { Location } from "@/types/locations";
import type { MilitaryBase } from "@/types/militaryBase";

const EVENT_TYPE_COLORS: Record<string, string> = {
  "armed-conflict": "#ef4444",
  "missle-strike": "#ef4444",
  "air-strike": "#ef4444",
  "ground-battle": "#ef4444",
  "protest": "#ef4444",
  other: "#6b7280",
};

const LOCATION_TYPE_COLORS: Record<string, string> = {
  "military-base-camp": "#3b82f6",
  "military-airfield": "#3b82f6",
  "military-port": "#3b82f6",
  "military-airport": "#3b82f6",
  "power-plant": "#f59e0b",
  other: "#6b7280",
};


function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export function createEventMarker(event: WorldEvent, map: maplibregl.Map): maplibregl.Marker {
  const color = EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.other;
  const el = document.createElement("div");
  el.className = "event-marker";
  el.style.cssText = `
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: ${color};
    border: 2px solid rgba(255,255,255,0.8);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  `;
  el.title = event.title;

  const popup = new maplibregl.Popup({ offset: 12, className: "map-popup-dark" }).setHTML(
    `<div style="min-width: 200px; font-family: system-ui, sans-serif;">
      <strong style="font-size: 14px;">${escapeHtml(event.title)}</strong>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px;">${escapeHtml(event.location.displayName)}</div>
      <p style="font-size: 12px; margin-top: 8px; line-height: 1.4;">${escapeHtml(event.summary)}</p>
    </div>`
  );

  return new maplibregl.Marker({ element: el })
    .setLngLat([event.location.lng, event.location.lat])
    .setPopup(popup)
    .addTo(map);
}

export function createLocationMarker(location: Location, map: maplibregl.Map): maplibregl.Marker {
  const color = LOCATION_TYPE_COLORS[location.type] ?? LOCATION_TYPE_COLORS.other;
  const el = document.createElement("div");
  el.className = "location-marker";
  el.style.cssText = `
    width: 14px;
    height: 14px;
    border-radius: 0;
    background-color: ${color};
    border: 2px solid rgba(255,255,255,0.8);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  `;
  el.title = location.name;

  const popup = new maplibregl.Popup({ offset: 12, className: "map-popup-dark" }).setHTML(
    `<div style="min-width: 180px; font-family: system-ui, sans-serif;">
      <strong style="font-size: 14px;">${escapeHtml(location.name)}</strong>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px;">${escapeHtml(location.displayName)}</div>
    </div>`
  );

  return new maplibregl.Marker({ element: el })
    .setLngLat([location.lng, location.lat])
    .setPopup(popup)
    .addTo(map);
}
