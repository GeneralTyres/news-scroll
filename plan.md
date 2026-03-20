# World Events Map — Cursor Plan Mode Prompt

## Project Overview

Build a **World Events Map** application — an interactive, news-atlas-style interface where geopolitical and world events (wars, disasters, elections, crises, etc.) are plotted as icons on a globe. Users can click icons to open a rich side panel with structured event information, and filter the map by date range and event type.

---

## Tech Stack (already installed)

- **Next.js** (App Router)
- **MapLibre GL JS** via `react-map-gl` or direct MapLibre bindings
- **shadcn/ui** for all UI components
- **TypeScript**
- **File-based data storage** (JSON files in `/data`) — no database yet

---

## Visual & Aesthetic Direction

The interface should feel like a **dark, editorial war-room dashboard** — think a blend of *The Economist* data journalism and a military operations map. Use:

- A **dark map basemap** (CartoDB Dark Matter: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`)
- **Monochromatic dark UI** (near-black background `#0e0e10`, dark panels) with sharp accent colors used *only* for event type indicators
- A **condensed, editorial typeface** (load `Barlow Condensed` from Google Fonts)
- Event icons: **bold SVG markers** with a colored ring + event-type glyph, styled per category

---

## Data Model

Create `/data/events.json` as the file-based data store. Each event follows this TypeScript interface:

```ts
// /types/event.ts
export interface WorldEvent {
  id: string;                        // slug, e.g. "russia-ukraine-2022"
  title: string;                     // e.g. "Russian Invasion of Ukraine"
  type: EventType;
  status: "ongoing" | "resolved" | "escalating" | "monitoring";
  startDate: string;                 // ISO "YYYY-MM-DD"
  endDate?: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region?: string;
    displayName: string;             // e.g. "Kyiv, Ukraine"
  };
  summary: string;                   // 2–4 sentence plain-text summary
  details: {
    casualties?: string;
    displaced?: string;
    partiesInvolved?: string[];
    keyDates?: { date: string; label: string }[];
    externalLinks?: { label: string; url: string }[];
  };
  tags?: string[];
  severity: 1 | 2 | 3 | 4 | 5;     // 1 = minor, 5 = critical
  lastUpdated: string;
}

export type EventType =
  | "armed-conflict"
  | "natural-disaster"
  | "political-crisis"
  | "humanitarian-crisis"
  | "election"
  | "terrorism"
  | "economic-crisis"
  | "protest"
  | "other";
```

Seed `/data/events.json` with **at least 12 diverse, realistic sample events** spanning multiple continents and event types, including a mix of ongoing and resolved events across the last 10 years.

---

## Application Structure

```
/app
  /page.tsx                  ← Main map page (full-screen layout)
  /layout.tsx                ← Root layout with fonts + theme
/components
  /map
    MapView.tsx              ← MapLibre map container, renders markers
    EventMarker.tsx          ← Individual map pin/icon component
    MarkerIcon.tsx           ← SVG icon per event type
  /sidebar
    EventSidebar.tsx         ← Sliding side panel (shadcn Sheet or custom)
    EventInfoBox.tsx         ← Wikipedia infobox-style structured display
    EventStatusBadge.tsx     ← Status pill (ongoing/resolved/escalating)
  /filters
    FilterBar.tsx            ← Top floating filter controls
    DateRangeFilter.tsx      ← Date range picker
    EventTypeFilter.tsx      ← Multi-select event type toggles
/data
  events.json                ← File-based event store
/types
  event.ts
/lib
  events.ts                  ← Data loading + filter logic
```

---

## Feature Requirements

### 1. Full-Screen Map (`MapView.tsx`)
- MapLibre fills the entire viewport (`100vw × 100vh`)
- Basemap: `https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json`
- Keep only zoom buttons (bottom-right), styled to match dark theme
- Events loaded from `/data/events.json` via `lib/events.ts`

### 2. Event Markers (`EventMarker.tsx`)
- Use **custom HTML markers** (not GL layers) so they can be styled React components
- Marker design:
  - Circular badge with a colored ring (color = event type)
  - Inner emoji/SVG glyph for the event type
  - Size scales slightly with `severity`
  - CSS pulse animation on `status: "ongoing"` or `"escalating"`
- Hover: small tooltip with `event.title`
- Click: set selected event → open sidebar

**Event type → color map:**
```
armed-conflict      → #ef4444  (red)
natural-disaster    → #f97316  (orange)
political-crisis    → #eab308  (yellow)
humanitarian-crisis → #a855f7  (purple)
election            → #3b82f6  (blue)
terrorism           → #dc2626  (dark red)
economic-crisis     → #06b6d4  (cyan)
protest             → #84cc16  (lime)
other               → #6b7280  (gray)
```

### 3. Event Side Panel (`EventSidebar.tsx` + `EventInfoBox.tsx`)
- Slides in from the **right** on event select (shadcn `Sheet` with `side="right"` or custom animated div)
- Width: `420px` desktop, full-width on mobile
- Closes via ✕ or clicking back on the map

**`EventInfoBox.tsx` — Wikipedia infobox layout:**
```
┌─────────────────────────────────────┐
│ [Event Type Badge]  [Status Badge]  │
│                                     │
│ EVENT TITLE                         │
│ Location display name               │
│                                     │
│ ┌─ INFO TABLE ──────────────────┐   │
│ │ Type         │ Armed Conflict │   │
│ │ Started      │ 24 Feb 2022    │   │
│ │ Status       │ Ongoing        │   │
│ │ Severity     │ ●●●●●          │   │
│ │ Casualties   │ Est. 100,000+  │   │
│ │ Displaced    │ 8 million      │   │
│ │ Parties      │ Russia,Ukraine │   │
│ └───────────────────────────────┘   │
│                                     │
│ SUMMARY                             │
│ [2–4 sentence paragraph]            │
│                                     │
│ KEY DATES                           │
│ • Feb 24 2022 — Full invasion began │
│                                     │
│ EXTERNAL LINKS                      │
│ → Wikipedia  → Reuters  → UN Report │
│                                     │
│ Last updated: March 2024            │
└─────────────────────────────────────┘
```
- Severity shown as filled dots (●) out of 5
- All optional fields render conditionally
- External links open in `_blank` with `rel="noopener noreferrer"`

### 4. Filter Bar (`FilterBar.tsx`)
- **Floating bar** at the top of the map (semi-transparent dark background + `backdrop-blur`)
- Contains:
  - **Date range:** Two date inputs. Shows events whose `startDate` falls within range, or ongoing events that started before the end date.
  - **Event type toggles:** A chip per `EventType` with its color dot. All selected by default.
  - **Status filter:** Quick pills — All / Ongoing / Resolved
  - **Result count:** Small label "X events shown"
- All filtering is **client-side reactive state** — no reloads
- Mobile: collapses to a filter icon button that opens a bottom sheet

### 5. Data Utilities (`lib/events.ts`)
```ts
export function getEvents(): WorldEvent[]

export function filterEvents(
  events: WorldEvent[],
  filters: {
    types?: EventType[];
    startDate?: string;
    endDate?: string;
    status?: string;
  }
): WorldEvent[]
```
Keep data access **isolated here** so swapping JSON for a DB later only touches this file.

---

## Layout

```
┌──────────────────────────────────────────────────────┐
│  [FilterBar — floating, top of map, backdrop-blur]   │
│                                                      │
│          [MapLibre Full-Screen Map]                  │
│                  [● Markers]                         │
│                                                      │
│                                          ┌─────────┐ │
│                                          │ Sidebar │ │
│                                          └─────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## Styling Notes

- CSS variables in `globals.css` for the full palette
- All shadcn components use `dark` theme
- Pulse animation for live events:
```css
@keyframes pulse-ring {
  0%   { box-shadow: 0 0 0 0 rgba(var(--event-color-rgb), 0.6); }
  70%  { box-shadow: 0 0 0 10px rgba(var(--event-color-rgb), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--event-color-rgb), 0); }
}
```
- Infobox table rows: alternating subtle background shading
- Respect `prefers-reduced-motion` (disable pulse if set)

---

## Deliverables Checklist

- [ ] `/types/event.ts` — full TypeScript types
- [ ] `/data/events.json` — 12+ seeded sample events
- [ ] `/lib/events.ts` — loader + filter utility
- [ ] `/components/map/MapView.tsx`
- [ ] `/components/map/EventMarker.tsx` — custom HTML markers with pulse
- [ ] `/components/sidebar/EventSidebar.tsx`
- [ ] `/components/sidebar/EventInfoBox.tsx`
- [ ] `/components/filters/FilterBar.tsx`
- [ ] `/app/page.tsx` — wires everything together
- [ ] Dark theme + editorial typography applied globally

---

## Implementation Notes for Cursor

- No database yet — all reads come from the static JSON file in `/data`
- Keep data access behind `lib/events.ts` to make a future DB migration a one-file change
- Prefer **client components** for map + interactive UI; load data server-side in `page.tsx` and pass as props
- For MapLibre markers: use `new maplibregl.Marker({ element: domNode })` with React portals, or `react-map-gl`'s `<Marker>` component — choose whichever fits the existing setup
- Keep all filter state in a single `useFilters` hook (or Zustand store if already used) so FilterBar and MapView stay in sync without prop drilling