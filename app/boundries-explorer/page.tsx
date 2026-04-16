import { BoundariesExplorerPageClient } from "@/components/boundaries-explorer/BoundariesExplorerPageClient";
import { countriesToBoundaryFeatureCollection } from "@/lib/maps/countryGeoJson";
import { loadCountriesWithBoundaries } from "@/lib/scarif/loaders/countries";

export const dynamic = "force-dynamic";

export default async function BoundriesExplorerPage() {
  const countries = await loadCountriesWithBoundaries();
  const initialFeatureCollection = countriesToBoundaryFeatureCollection(countries);
  return <BoundariesExplorerPageClient initialFeatureCollection={initialFeatureCollection} />;
}
