import { createScarifClient } from "@/lib/scarif/client";
import type { MilitaryBase } from "@/types/militaryBase";

export async function fetchMilitaryBasesByCountryIds(countryIds: number[]): Promise<MilitaryBase[]> {
  if (countryIds.length === 0) return [];
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("military_bases")
    .select(`
      id,
      type_now,
      name,
      geom,
      operator_country:countries!military_bases_operator_country_id_fkey(id, name, emoji),
      host_country:countries!military_bases_host_country_id_fkey(id, name, emoji)
    `)
    .in("operator_country_id", countryIds);
  if (!error && data) return data as MilitaryBase[];
  return [];
}

export async function fetchMilitaryBases(): Promise<MilitaryBase[]> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("military_bases")
    .select(`
      id,
      type_now,
      name,
      geom,
      operator_country:countries!military_bases_operator_country_id_fkey(id, name, emoji),
      host_country:countries!military_bases_host_country_id_fkey(id, name, emoji)
    `);
  if (!error && data) return data as MilitaryBase[];
  return [];
}
