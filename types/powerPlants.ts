import { Country } from "./countries";

export enum PrimaryFuel {
  COAL = "Coal",
  COGENERATION = "Cogeneration",
  WIND = "Wind",
  SOLAR = "Solar",
  STORAGE = "Storage",
  BIOMASS = "Biomass",
  WAVE_AND_TIDAL = "Wave and Tidal",
  HYDRO = "Hydro",
  OTHER = "Other",
  GAS = "Gas",
  WASTE = "Waste",
  GEOTHERMAL = "Geothermal",
  PETCOKE = "Petcoke",
  OIL = "Oil",
  NUCLEAR = "Nuclear",
}

export interface PowerPlant {
  id: number;
  name: string;
  geom: {
    type: "Point";
    coordinates: [number, number];
  };
  country: Country;
  primary_fuel: PrimaryFuel;
  capacity_in_mw: number;
}