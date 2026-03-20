import warsData from "@/data/wars.json";
import type { WarData } from "@/types/wars";

export function getWarById(id: string): WarData | undefined {
  const wars = warsData as WarData[];
  return wars.find((w) => w.id === id);
}
