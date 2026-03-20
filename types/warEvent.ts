export type EventType =
  | "missle-strike"
  | "air-strike"
  | "ground-battle"
  | "protest"
  | "other";

export interface WorldEvent {
  id: string;
  title: string;
  warId: string;
  type: EventType;
  startDate: string;
  endDate?: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region?: string;
    displayName: string;
  };
  geom?: {
    type: "Point";
    coordinates: [number, number];
  };
  summary: string;
  details: {
    partiesInvolved?: string[];
    externalLinks?: { label: string; url: string }[];
  };
  tags?: string[];
}
