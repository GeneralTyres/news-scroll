import maplibregl from "maplibre-gl";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";
import { createMilitaryBaseMarker } from "@/lib/war-map/markers";
import { createPowerPlantMarker } from "@/lib/services/powerPlants.service";

export interface LocationMarkersInput {
  militaryBases?: MilitaryBase[];
  powerPlants?: PowerPlant[];
}

/**
 * Create markers for bases and power plants (bases first, then plants). Reuses war-map marker styles.
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
