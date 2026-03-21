"use client";

import type { CountryWithBoundarySimple } from "@/types/countries";
import type { MilitaryBase } from "@/types/militaryBase";
import type { PowerPlant, PrimaryFuel } from "@/types/powerPlants";

import { SidePanel } from "@/components/common/SidePanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, Zap } from "lucide-react";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const chartConfig = {
  capacity_in_mw: {
    label: "Capacity in MW",
    color: "#2563eb",
  },
} satisfies ChartConfig

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

  // count power plants outputted by primary fuel
  const powerPlantsByPrimaryFuel = powerPlants.reduce((acc, powerPlant) => {
    acc[powerPlant.primary_fuel] = (acc[powerPlant.primary_fuel] || 0) + powerPlant.capacity_in_mw;
    return acc;
  }, {} as Record<PrimaryFuel, number>);

  // Count total power plants outputted
  const totalPowerPlantsOutputted = powerPlants.reduce((acc, powerPlant) => {
    return acc + powerPlant.capacity_in_mw;
  }, 0);

  const displayedPowerOutPutted = (totalPowerPlantsOutputted / 1000).toFixed(0);

  const chartData = Object.entries(powerPlantsByPrimaryFuel).map(([primaryFuel, count]) => ({
    primaryFuel,
    capacity_in_mw: count,
  }));

  console.log(chartData);

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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  Power Output
                </div>
                <Badge variant="secondary">{displayedPowerOutPutted} GW</Badge>
              </div>
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="primaryFuel"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value: string) => value.slice(0, 3)}
                  />
                  <Bar dataKey="capacity_in_mw" fill="var(--color-capacity_in_mw)" radius={4} />
                </BarChart>
              </ChartContainer>
            </>
          )}
        </CardContent>
      </Card>
    </SidePanel>
  );
}