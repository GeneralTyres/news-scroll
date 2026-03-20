import { createScarifClient } from "../scarif/client";
import type { Country, CountryWithBoundarySimple } from "@/types/countries";

let boundaryCountriesCache: {
  value: CountryWithBoundarySimple[] | null;
  ts: number;
} = { value: null, ts: 0 };

let boundaryCountriesInFlight: Promise<CountryWithBoundarySimple[]> | null =
  null;

const BOUNDARY_COUNTRIES_CACHE_TTL_MS = 60_000; // Reduce repeat loads; refreshes quickly.

export async function fetchCountries(): Promise<Country[]> {
  const scarif = createScarifClient();
  const { data, error } = await scarif.from("countries").select("id, name, emoji");
  if (!error && data) return data as Country[];
  return [];
}

export async function fetchCountryExplorerCountries(): Promise<CountryWithBoundarySimple[]> {
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

  const promise: Promise<CountryWithBoundarySimple[]> = (async () => {
    const scarif = createScarifClient();
    const { data, error } = await scarif
      .from("countries")
      .select("id, name, emoji, currency, currency_symbol, boundary_simple");

    if (!error && data) {
      const value = data as CountryWithBoundarySimple[];
      boundaryCountriesCache = { value, ts: Date.now() };
      return value;
    }
    boundaryCountriesCache = { value: null, ts: Date.now() };
    return [];
  })();

  boundaryCountriesInFlight = promise;
  promise.finally(() => {
    boundaryCountriesInFlight = null;
  });

  return promise;
}