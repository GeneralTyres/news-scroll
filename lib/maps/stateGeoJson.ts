import type { Feature, FeatureCollection } from "geojson";
import type { StateWithBoundarySimple } from "@/types/states";

export function statesToBoundaryFeatureCollection(
  states: ReadonlyArray<StateWithBoundarySimple>
): FeatureCollection {
  const features: Feature[] = [];
  for (const s of states) {
    if (!s.boundary_simple) continue;
    features.push({
      type: "Feature",
      geometry: s.boundary_simple,
      properties: {
        id: s.id,
        name: s.name,
      },
    });
  }
  return { type: "FeatureCollection", features };
}
