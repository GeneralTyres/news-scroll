import type { Geometry } from "geojson";
import { createScarifClient } from "@/lib/scarif/client";
import type { CountryWithBoundarySimple } from "@/types/countries";

const COUNTRY_WITH_BOUNDARY_SELECT =
  "id, name, emoji, currency, currency_symbol, currency_name, boundary_simple";

type CountryBoundaryRow = {
  id: number;
  name: string;
  emoji?: string | null;
  currency?: string | null;
  currency_symbol?: string | null;
  currency_name?: string | null;
  boundary_simple: Geometry | null;
};

function mapCountryRow(row: CountryBoundaryRow): CountryWithBoundarySimple {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji ?? "",
    currency: row.currency ?? "",
    currency_symbol: row.currency_symbol ?? "",
    currency_name: row.currency_name ?? "",
    boundary_simple: row.boundary_simple,
  };
}

/** Fetches countries from Scarif with boundary and metadata fields. Returns null on failure. */
export async function loadCountryExplorerCountries(): Promise<
  CountryWithBoundarySimple[] | null
> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("countries")
    .select(COUNTRY_WITH_BOUNDARY_SELECT);

  if (error || !data) return null;

  return (data as CountryBoundaryRow[]).map(mapCountryRow);
}

/** Countries that have a simplified boundary geometry (for map-only views). */
export async function loadCountriesWithBoundaries(): Promise<
  CountryWithBoundarySimple[]
> {
  const countries = await loadCountryExplorerCountries();
  if (!countries) return [];
  return countries.filter(
    (c): c is CountryWithBoundarySimple => c.boundary_simple != null
  );
}
