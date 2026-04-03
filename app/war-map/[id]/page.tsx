import { notFound } from "next/navigation";
import { getWarById } from "@/lib/wars";
import { getEventsByWarId } from "@/lib/events";
import { WarMapPageClient } from "@/components/war-map/WarMapPageClient";
import { fetchPowerPlantsByCountryIds } from "@/lib/services/power-plants/powerPlants.service";
import { fetchCountries } from "@/lib/services/countries/country.service";
import { convertWarDataToWar } from "@/lib/war-map/dataConverstion";
import {fetchMilitaryBasesByCountryIds} from "@/lib/services/military-bases/militaryBases.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WarMapPage({ params }: PageProps) {
  const { id } = await params;
  const loadedWar = getWarById(id);
  if (!loadedWar) notFound();
  const countries = await fetchCountries();
  // Convert war data to war
  const war = convertWarDataToWar(loadedWar, countries);
  const events = getEventsByWarId(id);
  // Get all countries involved in the war
  const countriesInvolved = war.sides.flatMap((side) => side.partiesInvolvedI.map((country) => country.id));
  // Get all supporters of the war
  const supporters = war.sides.flatMap((side) => side.supportersI.map((country) => country.id));
  // Get all countries involved in the war and supporters
  const countriesInvolvedAndSupporters = [...countriesInvolved, ...supporters];
  // Only fetch military bases for the countries involved in the war and supporters
  const militaryBases = await fetchMilitaryBasesByCountryIds(countriesInvolvedAndSupporters);
  // Get all power plants for the countries involved in the war and supporters
  const powerPlants = await fetchPowerPlantsByCountryIds(countriesInvolvedAndSupporters);

  return <WarMapPageClient events={events} militaryBases={militaryBases} powerPlants={powerPlants} war={war} />;
}
