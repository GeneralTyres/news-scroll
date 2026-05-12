"use client";

import { useCallback, useMemo, useState } from "react";
import type { CountryWithBoundarySimple } from "@/types/countries";
import { countriesToBoundaryFeatureCollection } from "@/lib/maps/countryGeoJson";
import { fetchMilitaryBasesByCountryIds } from "@/lib/services/military-bases/militaryBases.service";
import { fetchPowerPlantsByCountryIds } from "@/lib/services/power-plants/powerPlants.service";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";
import { CountryExplorerMapView } from "./CountryExplorerMapView";
import { SidePanel } from "@/components/common/SidePanel";
import { CommonLoadingScreen } from "@/components/common/CommonLoadingScreen";
import { CountrySidePanel } from "./CountrySidePanel";
import { CountrySearch } from "./CountrySearch";

export interface CountryExplorerPageClientProps {
  countries: ReadonlyArray<CountryWithBoundarySimple>;
}

export function CountryExplorerPageClient(props: Readonly<CountryExplorerPageClientProps>) {
  const { countries } = props;
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [militaryBases, setMilitaryBases] = useState<MilitaryBase[]>([]);
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([]);
  const [loading, setLoading] = useState(false);

  const removedSet = useMemo(() => new Set(removedIds), [removedIds]);

  const visibleCountries = useMemo(
    () => countries.filter((c) => !removedSet.has(c.id)),
    [countries, removedSet]
  );

  const boundaryFeatureCollection = useMemo(
    () => {
      const fc = countriesToBoundaryFeatureCollection(visibleCountries);
      return fc;
    },
    [visibleCountries]
  );

  const handleCountryPick = useCallback(async (countryId: number) => {
    // Only hide the currently selected country boundary.
    // Previously selected countries should re-appear when picking a new one.
    setRemovedIds([countryId]);
    setSelectedCountryId(countryId);
    setLoading(true);
    try {
      const [bases, plants] = await Promise.all([
        fetchMilitaryBasesByCountryIds([countryId]),
        fetchPowerPlantsByCountryIds([countryId]),
      ]);
      setMilitaryBases(bases);
      setPowerPlants(plants);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === selectedCountryId) ?? null,
    [countries, selectedCountryId]
  );

  return (
    <div className="relative h-screen w-screen bg-zinc-950">
      <SidePanel side="left" className="w-[min(100%-2rem,240px)] w-[25%]">
        <CountrySearch
          countries={visibleCountries}
          onSelect={handleCountryPick}
        />
      </SidePanel>

      {selectedCountry && (
        <CountrySidePanel
          country={selectedCountry}
          loading={loading}
          militaryBases={militaryBases}
          powerPlants={powerPlants}
        />
      )}

      <CountryExplorerMapView
        boundaryFeatureCollection={boundaryFeatureCollection}
        militaryBases={militaryBases}
        powerPlants={powerPlants}
        onCountryPick={handleCountryPick}
        fitToMarkersKey={selectedCountryId}
      />

      {loading && <CommonLoadingScreen label="Loading country data..." />}
    </div>
  );
}
