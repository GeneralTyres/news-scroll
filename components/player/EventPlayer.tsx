"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, Calendar } from "lucide-react";
import type { WorldEvent } from "@/types/warEvent";
import type { MapViewApi } from "@/components/war-map/WarMapView";
import { cn } from "@/lib/utils";

const PLAY_INTERVAL_MS = 2500;

function getDefaultDateRange() {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  return {
    from: oneMonthAgo.toISOString().slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

function filterEventsByDateRange(
  events: WorldEvent[],
  from: string,
  to: string
): WorldEvent[] {
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime();
  return events
    .filter((e) => {
      const d = new Date(e.startDate).getTime();
      return d >= fromTime && d <= toTime;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

interface EventPlayerProps {
  events: WorldEvent[];
  mapApi: MapViewApi | null;
  onClose: () => void;
}

export function EventPlayer({ events, mapApi, onClose }: EventPlayerProps) {
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredEvents = filterEventsByDateRange(
    events,
    dateRange.from,
    dateRange.to
  );

  const currentEvent = filteredEvents[currentIndex] ?? null;
  const hasEvents = filteredEvents.length > 0;

  const goToEvent = useCallback(
    (ev: WorldEvent) => {
      mapApi?.flyToEvent(ev);
    },
    [mapApi]
  );

  useEffect(() => {
    if (!isPlaying || !currentEvent || !mapApi) return;

    goToEvent(currentEvent);

    const timer = setTimeout(() => {
      setCurrentIndex((i) => {
        const next = i + 1;
        if (next >= filteredEvents.length) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, PLAY_INTERVAL_MS);

    return () => clearTimeout(timer);
  }, [isPlaying, currentIndex, currentEvent, mapApi, goToEvent, filteredEvents.length]);

  const handlePlayPause = () => {
    if (!hasEvents) return;
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentIndex(0);
      setIsPlaying(true);
    }
  };

  const handleDateChange = (field: "from" | "to", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div
      className={cn(
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-10",
        "flex flex-col gap-3 p-4 rounded-lg shadow-xl",
        "bg-zinc-900/95 backdrop-blur border border-zinc-700/50",
        "min-w-[320px]"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <Calendar className="size-4" />
          <span className="text-sm font-medium">Date range</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
        >
          Exit player
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => handleDateChange("from", e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-600 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
        <span className="self-center text-zinc-500">→</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => handleDateChange("to", e.target.value)}
          className="flex-1 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-600 text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handlePlayPause}
          disabled={!hasEvents}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-colors",
            hasEvents
              ? "bg-zinc-700 hover:bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          )}
        >
          {isPlaying ? (
            <>
              <Pause className="size-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="size-4" />
              Play
            </>
          )}
        </button>
        <span className="text-sm text-zinc-400">
          {hasEvents
            ? `${currentIndex + 1} / ${filteredEvents.length} events`
            : "No events in range"}
        </span>
      </div>

      {currentEvent && (
        <div className="text-xs text-zinc-500 truncate" title={currentEvent.title}>
          Now: {currentEvent.title}
        </div>
      )}
    </div>
  );
}
