import { Country } from "./countries";

export enum MilitaryBaseType {
  GROUND_BASE = "Ground Base",
  AIR_BASE = "Air Base",
  NAVAL_BASE = "Naval Base",
  MISSILE_BASE = "Missile Base",
  MAJOR_BASE = "Major Base",
  LOGISTICS_BASE = "Logistics Base",
  OTHER = "Other",
}

export interface MilitaryBase {
  id: number;
  type_now: MilitaryBaseType | null;
  country_id: number | null;
  name: string;
  lat: number;
  lng: number;
  // geom geometry(Point, 4326)
  geom: {
    type: "Point";
    coordinates: [number, number];
  };
  host_country: Country;
  operator_country: Country;
}
