import { loadCountryExplorerCountries } from "@/lib/scarif/loaders/countries";
import type { CountryWithBoundarySimple } from "@/types/countries";

let boundaryCountriesCache: {
  value: CountryWithBoundarySimple[] | null;
  ts: number;
} = { value: null, ts: 0 };

let boundaryCountriesInFlight: Promise<CountryWithBoundarySimple[]> | null =
  null;

const BOUNDARY_COUNTRIES_CACHE_TTL_MS = 60_000;

/** Cached countries for the country explorer (TTL + in-flight dedup). */
export async function fetchCountryExplorerCountries(): Promise<
  CountryWithBoundarySimple[]
> {
  const now = Date.now();
  if (
    boundaryCountriesCache.value &&
    now - boundaryCountriesCache.ts < BOUNDARY_COUNTRIES_CACHE_TTL_MS
  ) {
    return boundaryCountriesCache.value;
  }

  if (boundaryCountriesInFlight) {
    return boundaryCountriesInFlight;
  }

  const promise = loadCountryExplorerCountries().then((value) => {
    if (value === null) return [];
    boundaryCountriesCache = { value, ts: Date.now() };
    return value;
  });

  boundaryCountriesInFlight = promise;
  promise.finally(() => {
    boundaryCountriesInFlight = null;
  });

  return promise;
}
