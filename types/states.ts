import type { Geometry } from "geojson";

/** Row from `states` when selecting `boundary_simple` (PostGIS → GeoJSON). */
export interface StateWithBoundarySimple {
  id: number;
  name: string;
  country_id: number | null;
  parent_id: number | null;
  boundary_simple: Geometry | null;
}
