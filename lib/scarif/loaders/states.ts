import { createScarifClient } from "@/lib/scarif/client";
import type { StateWithBoundarySimple } from "@/types/states";

export async function loadTopLevelStatesByCountry(
  countryId: number
): Promise<StateWithBoundarySimple[]> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("states")
    .select("id, name, country_id, parent_id, boundary_simple")
    .eq("country_id", countryId)
    .isNull("parent_id");

  if (error || !data) return [];
  return (data as StateWithBoundarySimple[]).filter((s) => s.boundary_simple != null);
}

export async function loadChildStates(parentId: number): Promise<StateWithBoundarySimple[]> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("states")
    .select("id, name, country_id, parent_id, boundary_simple")
    .eq("parent_id", parentId);

  if (error || !data) return [];
  return (data as StateWithBoundarySimple[]).filter((s) => s.boundary_simple != null);
}

export async function loadStateById(id: number): Promise<StateWithBoundarySimple | null> {
  const scarif = createScarifClient();
  const { data, error } = await scarif
    .from("states")
    .select("id, name, country_id, parent_id, boundary_simple")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as StateWithBoundarySimple;
}
