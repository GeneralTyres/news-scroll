"use server";

import { statesToBoundaryFeatureCollection } from "@/lib/maps/stateGeoJson";
import { loadChildStates, loadTopLevelStatesByCountry } from "@/lib/scarif/loaders/states";
import type { FeatureCollection } from "geojson";

export async function fetchBoundaryChildrenForCountry(countryId: number): Promise<FeatureCollection> {
  const rows = await loadTopLevelStatesByCountry(countryId);
  return statesToBoundaryFeatureCollection(rows);
}

export async function fetchBoundaryChildrenForState(parentId: number): Promise<FeatureCollection> {
  const rows = await loadChildStates(parentId);
  return statesToBoundaryFeatureCollection(rows);
}
