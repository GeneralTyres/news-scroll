export type LocationType =
  | "military-base-camp"
  | "military-airfield"
  | "military-port"
  | "military-airport"
  | "power-plant"
  | "other";


export interface Location {
  id: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
  country: string;
  region?: string;
  displayName: string;
}