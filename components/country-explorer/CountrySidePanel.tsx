"use client";

import type { CountryWithBoundarySimple } from "@/types/countries";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant } from "@/types/powerPlants";

import { SidePanel } from "@/components/common/SidePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, Zap } from "lucide-react";

interface CountrySidePanelProps {
  country: CountryWithBoundarySimple;
  loading: boolean;
  militaryBases: MilitaryBase[];
  powerPlants: PowerPlant[];
}

export function CountrySidePanel({
  country,
  loading,
  militaryBases,
  powerPlants,
}: Readonly<CountrySidePanelProps>) {
  return (
    <SidePanel
      side="right"
      className="w-[min(100%-2rem,300px)]"
      title={
        <div className="text-sm font-semibold flex items-center gap-2">
          <span className="text-lg">{country.emoji}</span>
          {country.name}
        </div>
      }
    >
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0 pb-2">
          <CardTitle className="text-xs text-muted-foreground">
            Overview
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 space-y-3">
          {loading ? (
            <>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Landmark className="h-4 w-4 text-muted-foreground" />
                  Military Bases
                </div>
                <Badge variant="secondary">{militaryBases.length}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Power Plants
                </div>
                <Badge variant="secondary">{powerPlants.length}</Badge>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </SidePanel>
  );
}