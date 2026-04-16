import type { Geometry } from "geojson";
import { createScarifClient } from "@/lib/scarif/client";
import type { CountryWithBoundarySimple } from "@/types/countries";

type CountryBoundaryRow = {
  id: number;
  name: string;
  emoji?: string | null;
  boundary_simple: Geometry | null;
  boundary?: Geometry | null;
};

export async function loadCountriesWithBoundaries(): Promise<CountryWithBoundarySimple[]> {
  const scarif = createScarifClient();
  // Select full `boundary` too — DB may only populate `boundary` while `boundary_simple` is null.
  const { data, error } = await scarif
    .from("countries")
    .select("id, name, emoji, boundary_simple, boundary");

    console.log(data);

  if (error || !data) return [];

  const mapped = (data as CountryBoundaryRow[])
    .map((c) => {
      const geom = c.boundary_simple ?? c.boundary ?? null;
      return {
        id: c.id,
        name: c.name,
        emoji: c.emoji ?? "",
        currency: "",
        currency_symbol: "",
        currency_name: "",
        boundary_simple: geom,
      } as CountryWithBoundarySimple;
    })
    .filter((c) => c.boundary_simple != null);

  return mapped;
}
