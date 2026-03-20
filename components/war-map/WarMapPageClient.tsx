"use client";

import { useCallback, useMemo, useState } from "react";
import { MapView, type MapViewApi } from "@/components/war-map/WarMapView";
import { WarMapFilter } from "@/components/war-map/WarMapFilter";
import { EventPlayer } from "@/components/player/EventPlayer";
import type { WorldEvent } from "@/types/warEvent";
import type { MilitaryBase } from "@/types/militaryBase";
import { cn } from "@/lib/utils";
import { getDefaultFilterState, filterEntities, type WarMapFilterState } from "@/lib/war-map/warMapFilter.config";
import type { PowerPlant } from "@/types/powerPlants";
import { War } from "@/types/wars";

interface MapPageClientProps {
  events: WorldEvent[];
  militaryBases: MilitaryBase[];
  powerPlants: PowerPlant[];
  war: War;
}

export function WarMapPageClient({ militaryBases, powerPlants, war }: MapPageClientProps) {
  const [isPlayerMode, setIsPlayerMode] = useState(false);
  const [filterState, setFilterState] = useState<WarMapFilterState>(getDefaultFilterState);
  const [mapApi, setMapApi] = useState<MapViewApi | null>(null);

  const filteredBases = useMemo(
    () => filterEntities<MilitaryBase>("militaryBases", militaryBases, filterState),
    [militaryBases, filterState]
  );
  const filteredPowerPlants = useMemo(
    () => filterEntities<PowerPlant>("powerPlants", powerPlants, filterState),
    [powerPlants, filterState]
  );
  const handleMapReady = useCallback((api: MapViewApi) => {
    setMapApi(api);
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <MapView events={[]} militaryBases={filteredBases} powerPlants={filteredPowerPlants} onMapReady={handleMapReady} />

      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-300">{war.name}</span>
        <WarMapFilter filterState={filterState} onFilterChange={setFilterState} />
        <button
        onClick={() => setIsPlayerMode((p) => !p)}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
          "bg-zinc-900/90 text-white backdrop-blur-sm hover:bg-zinc-800",
          "border border-zinc-700/50 shadow-lg"
        )}
        aria-pressed={isPlayerMode}
        >
          {isPlayerMode ? "Exit player" : "Player mode"}
        </button>
      </div>

      {isPlayerMode && mapApi != null && (
        <EventPlayer
          events={[]}
          mapApi={mapApi}
          onClose={() => setIsPlayerMode(false)}
        />
      )}
    </div>
  );
}
