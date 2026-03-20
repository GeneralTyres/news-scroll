import type { WarData } from "@/types/wars";
import type { War } from "@/types/wars";
import type { Country } from "@/types/countries";

export function convertWarDataToWar(warData: WarData, countries: Country[]): War {
  return {
    id: warData.id,
    name: warData.name,
    startDate: warData.startDate,
    endDate: warData.endDate,
    sides: warData.sides.map((side) => ({
      name: side.name,
      color: side.color,
      partiesInvolvedI: side.partiesInvolvedIds.map((id) => countries.find((c) => c.id === id)).filter((c) => c !== undefined) as Country[],
      supportersI: side.supportersIds.map((id) => countries.find((c) => c.id === id)).filter((c) => c !== undefined) as Country[],
    })),
  };
}