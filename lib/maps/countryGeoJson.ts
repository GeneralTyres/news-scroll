import type { Feature, FeatureCollection } from "geojson";
import type { CountryWithBoundarySimple } from "@/types/countries";

export function countriesToBoundaryFeatureCollection(
  countries: ReadonlyArray<CountryWithBoundarySimple>
): FeatureCollection {
  const features: Feature[] = [];
  for (const c of countries) {
    if (!c.boundary_simple) continue;
    features.push({
      type: "Feature",
      geometry: c.boundary_simple,
      properties: {
        id: c.id,
        name: c.name,
        emoji: c.emoji ?? "",
      },
    });
  }
  return { type: "FeatureCollection", features };
}

/** Empty collection — useful before data loads. */
export function emptyFeatureCollection(): FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}
