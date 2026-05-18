import type { Geometry } from "geojson";
import { createScarifClient } from "@/lib/scarif/client";
import type { CountryWithBoundarySimple } from "@/types/countries";

type CountryBoundaryRow = {
  id: number;
  name: string;
  emoji?: string | null;
  boundary_simple: Geometry | null;
};

export async function loadCountriesWithBoundaries(): Promise<CountryWithBoundarySimple[]> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("countries")
    .select("id, name, emoji, boundary_simple");

  if (error || !data) return [];

  return (data as CountryBoundaryRow[])
    .map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji ?? "",
      currency: "",
      currency_symbol: "",
      currency_name: "",
      boundary_simple: c.boundary_simple,
    }))
    .filter((c): c is CountryWithBoundarySimple => c.boundary_simple != null);
}
