"use client";

import Link from "next/link";
import { Navbar } from "@/components/common/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

type MapConfig = {
  name: string;
  description: string;
  url: string;
}

export default function Home() {

  const maps: MapConfig[] = [
    {
      name: 'Country Explorer',
      description: 'Browse countries, explore data, and interact with geographic insights.',
      url: "/country-explorer",
    }
  ]

  return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />

        <main className="mx-auto max-w-6xl px-6 py-20">
          {/* Header */}
          <div className="mb-12 space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight">
              News Scroll
            </h1>
            <p className="max-w-2xl text-muted-foreground text-lg">
              Explore interactive maps and datasets. Each map offers a different
              perspective on global data.
            </p>
          </div>

          {/* Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {maps.map((map) => (
              <Card key={map.url} className="group relative overflow-hidden border border-border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl">
                {/* Gradient glow */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 bg-linear-to-br from-blue-500/10 via-transparent to-red-500/10" />

                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500 transition group-hover:scale-110">
                      <Map className="h-5 w-5" />
                    </div>
                    <CardTitle>{map.name}</CardTitle>
                  </div>
                  <CardDescription>
                    {map.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Interactive map
                </span>

                  <Link href={map.url}>
                    <Button
                        variant="outline"
                        className="transition group-hover:border-blue-500 group-hover:text-blue-500"
                    >
                      Open
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}

            {/* Placeholder */}
            <Card className="border-dashed border-muted opacity-60">
              <CardHeader>
                <CardTitle>More Maps Coming</CardTitle>
                <CardDescription>
                  Additional map experiences will appear here as they are added.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </main>
      </div>
  );
}