import { createScarifClient } from "../scarif/client";
import type { PowerPlant } from "@/types/powerPlants";
import { PrimaryFuel } from "@/types/powerPlants";
import type { Country } from "@/types/countries";
import maplibregl from "maplibre-gl";
import { buildSVGMarkerElement } from "@/lib/maps/svgMarkerUtils";

const POWER_PLANT_STYLE: Record<
  PrimaryFuel,
  { color: string; svgPath?: string }
> = {
  [PrimaryFuel.COAL]: { color: "#1c1917", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.COGENERATION]: { color: "#f97316", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.GAS]: { color: "#737373", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.OIL]: { color: "#3f3f46", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.PETCOKE]: { color: "#3f3f46", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.NUCLEAR]: { color: "#a855f7", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.HYDRO]: { color: "rgb(0, 26, 255)", svgPath: "/icons/hydro-power-water.svg" },
  [PrimaryFuel.WIND]: { color: "#14b8a6", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.SOLAR]: { color: "#facc15", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.STORAGE]: { color: "#fb7185", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.BIOMASS]: { color: "#22c55e", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.WASTE]: { color: "#a16207", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.GEOTHERMAL]: { color: "#ef4444", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.WAVE_AND_TIDAL]: { color: "#60a5fa", svgPath: "/icons/power-plant.svg" },
  [PrimaryFuel.OTHER]: { color: "#a1a1aa", svgPath: "/icons/power-plant.svg" },
};

export async function fetchPowerPlantsByCountryIds(
  countryIds: number[],
  minCapacityInMW?: number | undefined
): Promise<PowerPlant[]> {
  if (countryIds.length === 0) {
    return [];
  }
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("power_plants")
    .select(`
      id,
      name,
      primary_fuel,
      capacity_in_mw,
      geom,
      country:countries!power_plants_country_id_fkey(id, name, emoji)
    `)
    .order("capacity_in_mw", "desc")
    .limit(1000)
    .in("country_id", countryIds);
  if (!error && data) return data as PowerPlant[];
  return [];
}

export async function fetchPowerPlants(minCapacityInMW?: number | undefined): Promise<PowerPlant[]> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("power_plants")
    .select(`
      id,
      name,
      primary_fuel,
      capacity_in_mw,
      geom,
      country:countries!power_plants_country_id_fkey(id, name, emoji)
    `).
    gte('capacity_in_mw', minCapacityInMW ?? 0);
  if (!error && data) return data as PowerPlant[];
  return [];
}

function formatPrimaryFuel(primaryFuel: PrimaryFuel): string {
  return primaryFuel.replace("_", " ").charAt(0).toUpperCase() + primaryFuel.replace("_", " ").slice(1);
}

function formatCountries(powerPlant: PowerPlant): string {
  return (
    [powerPlant.country]
      ?.map((country: Country) => `${country?.name || 'Unknown'} ${country?.emoji || ''}`)
      .join(", ") || "Unknown"
  );
}

function buildFallbackMarkerElement(color: string): HTMLDivElement {
  const el = document.createElement("div");
  el.className = "location-marker power-plant-marker";
  el.style.cssText = `
    width: 14px;
    height: 14px;
    border-radius: 0;
    background-color: ${color};
    border: 2px solid rgba(255,255,255,0.8);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.4);
  `;
  return el;
}

export async function createPowerPlantMarker(
  powerPlant: PowerPlant,
  map: maplibregl.Map
): Promise<maplibregl.Marker | null> {
  if (!powerPlant?.geom?.coordinates?.[0] || !powerPlant?.geom?.coordinates?.[1]) return null;
  const style = POWER_PLANT_STYLE[powerPlant.primary_fuel] ?? POWER_PLANT_STYLE[PrimaryFuel.OTHER];
  const el = style.svgPath
    ? await buildSVGMarkerElement(style.color, style.svgPath, "location-marker power-plant-marker")
    : buildFallbackMarkerElement(style.color);
  el.title = powerPlant.name;

  const popup = new maplibregl.Popup({ offset: 12, className: "map-popup-dark" }).setHTML(
    `<div style="min-width: 180px; font-family: system-ui, sans-serif;">
      <strong style="font-size: 14px;">${powerPlant.name}</strong>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px; font-style: italic;">${formatPrimaryFuel(powerPlant.primary_fuel)}</div>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px;">Capacity: ${powerPlant.capacity_in_mw} MW</div>
      <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px;">${formatCountries(powerPlant)}</div>
    </div>`
  );

  return new maplibregl.Marker({ element: el })
    .setLngLat([powerPlant.geom.coordinates[0], powerPlant.geom.coordinates[1]])
    .setPopup(popup)
    .addTo(map);
}
