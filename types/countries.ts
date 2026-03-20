import type { Geometry } from "geojson";

export interface CountryAssociation {
  id: number;
  name: string;
  emoji: string;
}

export interface Country {
  id: number;
  name: string;
  emoji: string;
  currency: string;
  currency_symbol: string;
  currency_name: string;
}

/** Row from `countries` when selecting `boundary_simple` (PostGIS → GeoJSON). */
export interface CountryWithBoundarySimple extends Country {
  boundary_simple: Geometry | null;
}