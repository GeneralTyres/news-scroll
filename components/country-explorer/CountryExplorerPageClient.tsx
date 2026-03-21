"use client";

import { useCallback, useMemo, useState } from "react";
import type { CountryWithBoundarySimple } from "@/types/countries";
import { countriesToBoundaryFeatureCollection } from "@/lib/maps/countryGeoJson";
import { fetchMilitaryBasesByCountryIds } from "@/lib/services/military-bases/militaryBases.service";
import { fetchPowerPlantsByCountryIds } from "@/lib/services/powerPlants.service";
import { cn } from "@/lib/utils";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";
import { CountryExplorerMapView } from "./CountryExplorerMapView";
import { SidePanel } from "@/components/common/SidePanel";
import { CommonLoadingScreen } from "@/components/common/CommonLoadingScreen";
import { CountrySidePanel } from "./CountrySidePanel";

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
      <SidePanel side="left" className="w-[min(100%-2rem,240px)]">
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">Country explorer</h1>
          <p className="text-xs text-zinc-500">Click a country on the map or list.</p>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Boundaries
          </div>
          <ul className="max-h-[50vh] overflow-y-auto text-sm">
            {visibleCountries.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => void handleCountryPick(c.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-zinc-300",
                    "hover:bg-zinc-800/80 hover:text-zinc-100"
                  )}
                >
                  <span>{c.emoji}</span>
                  <span className="truncate">{c.name}</span>
                  {!c.boundary_simple && (
                    <span className="ml-auto text-[10px] text-zinc-600">no poly</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
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
