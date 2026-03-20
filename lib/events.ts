import eventsData from "@/data/warEvents.json";
import type { WorldEvent } from "@/types/warEvent";

export function getEvents(): WorldEvent[] {
  return eventsData as WorldEvent[];
}

export function getEventsByWarId(warId: string): WorldEvent[] {
  return (eventsData as WorldEvent[]).filter((e) => e.warId === warId);
}
