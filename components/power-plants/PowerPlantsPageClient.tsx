"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PowerPlantsView, type MapViewApi } from "@/components/power-plants/PowerPlantsView";
import { fetchPowerPlants } from "@/lib/services/power-plants/powerPlants.service";
import type { PowerPlant } from "@/types/powerPlants";

export function PowerPlantsPageClient() {
  const mapApiRef = useRef<MapViewApi | null>(null);
  const [powerPlants, setPowerPlants] = useState<PowerPlant[]>([]);

  useEffect(() => {
    fetchPowerPlants().then((powerPlants) => setPowerPlants(powerPlants));
  }, []);

  const handleMapReady = useCallback((api: MapViewApi) => {
    mapApiRef.current = api;
  }, []);

  return (
    <div className="relative h-screen w-screen">
      <PowerPlantsView powerPlants={powerPlants} onMapReady={handleMapReady} />
    </div>
  );
}
