import maplibregl from "maplibre-gl";
import type { Feature, FeatureCollection, Point } from "geojson";
import type { MilitaryBase } from "@/types/militaryBase";
import { MilitaryBaseType } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";
import { PrimaryFuel } from "@/types/powerPlants";
import { createMilitaryBaseMarker } from "@/lib/services/military-bases/militaryBaseMarkers";
import { createPowerPlantMarker } from "@/lib/services/power-plants/powerPlants.service";

export interface LocationMarkersInput {
  militaryBases?: MilitaryBase[];
  powerPlants?: PowerPlant[];
}

export interface ExplorerPointProperties {
  id: number;
  label: string;
  category: "military" | "power";
  detail: string;
  color: string;
}

export type ExplorerPointFeature = Feature<Point, ExplorerPointProperties>;

export const EMPTY_POINT_COLLECTION: FeatureCollection<Point, ExplorerPointProperties> = {
  type: "FeatureCollection",
  features: [],
};

const MILITARY_BASE_COLORS: Record<string, string> = {
  [MilitaryBaseType.GROUND_BASE]: "#3b82f6",
  [MilitaryBaseType.NAVAL_BASE]: "#0ea5e9",
  [MilitaryBaseType.AIR_BASE]: "#8b5cf6",
  [MilitaryBaseType.MISSILE_BASE]: "#ef4444",
  [MilitaryBaseType.MAJOR_BASE]: "#eab308",
  [MilitaryBaseType.LOGISTICS_BASE]: "#a54100",
  [MilitaryBaseType.OTHER]: "#6b7280",
};

const POWER_PLANT_COLORS: Record<string, string> = {
  [PrimaryFuel.COAL]: "#1c1917",
  [PrimaryFuel.COGENERATION]: "#f97316",
  [PrimaryFuel.GAS]: "#737373",
  [PrimaryFuel.OIL]: "#3f3f46",
  [PrimaryFuel.PETCOKE]: "#3f3f46",
  [PrimaryFuel.NUCLEAR]: "#a855f7",
  [PrimaryFuel.HYDRO]: "#001aff",
  [PrimaryFuel.WIND]: "#14b8a6",
  [PrimaryFuel.SOLAR]: "#facc15",
  [PrimaryFuel.STORAGE]: "#fb7185",
  [PrimaryFuel.BIOMASS]: "#22c55e",
  [PrimaryFuel.WASTE]: "#a16207",
  [PrimaryFuel.GEOTHERMAL]: "#ef4444",
  [PrimaryFuel.WAVE_AND_TIDAL]: "#60a5fa",
  [PrimaryFuel.OTHER]: "#a1a1aa",
};

export function militaryBasesToPointCollection(
  militaryBases: MilitaryBase[]
): FeatureCollection<Point, ExplorerPointProperties> {
  const features: ExplorerPointFeature[] = militaryBases
    .filter((base) => base.geom?.coordinates?.[0] != null && base.geom?.coordinates?.[1] != null)
    .map((base) => {
      const type = base.type_now ?? MilitaryBaseType.OTHER;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [base.geom.coordinates[0], base.geom.coordinates[1]] },
        properties: {
          id: base.id,
          label: base.name,
          category: "military",
          detail: type,
          color: MILITARY_BASE_COLORS[type] ?? MILITARY_BASE_COLORS[MilitaryBaseType.OTHER],
        },
      };
    });
  return { type: "FeatureCollection", features };
}

export function powerPlantsToPointCollection(
  powerPlants: PowerPlant[]
): FeatureCollection<Point, ExplorerPointProperties> {
  const features: ExplorerPointFeature[] = powerPlants
    .filter((plant) => plant.geom?.coordinates?.[0] != null && plant.geom?.coordinates?.[1] != null)
    .map((plant) => {
      const fuel = plant.primary_fuel ?? PrimaryFuel.OTHER;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [plant.geom.coordinates[0], plant.geom.coordinates[1]] },
        properties: {
          id: plant.id,
          label: plant.name,
          category: "power",
          detail: `${fuel} - ${plant.capacity_in_mw} MW`,
          color: POWER_PLANT_COLORS[fuel] ?? POWER_PLANT_COLORS[PrimaryFuel.OTHER],
        },
      };
    });
  return { type: "FeatureCollection", features };
}

export function buildExplorerPointPopupHtml(
  properties: Partial<ExplorerPointProperties> | undefined
): string {
  const label = properties?.label ?? "Unknown";
  const detail = properties?.detail ?? "";
  const category = properties?.category ?? "point";
  return `<div style="min-width: 180px; font-family: system-ui, sans-serif;">
    <strong style="font-size: 14px;">${label}</strong>
    <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px;">${detail}</div>
    <div style="color: #a1a1aa; font-size: 12px; margin-top: 4px; text-transform: capitalize;">${category}</div>
  </div>`;
}

/**
 * Create markers for bases and power plants (bases first, then plants). Reuses shared marker styles.
 */
export async function createMilitaryAndPowerPlantMarkers(
  map: maplibregl.Map,
  input: LocationMarkersInput,
  isCancelled?: () => boolean
): Promise<maplibregl.Marker[]> {
  const markers: maplibregl.Marker[] = [];
  const bases = input.militaryBases ?? [];
  const plants = input.powerPlants ?? [];

  for (const base of bases) {
    if (isCancelled?.()) break;
    const m = await createMilitaryBaseMarker(base, map);
    if (m) markers.push(m);
  }
  for (const p of plants) {
    if (isCancelled?.()) break;
    const m = await createPowerPlantMarker(p, map);
    if (m) markers.push(m);
  }
  return markers;
}
