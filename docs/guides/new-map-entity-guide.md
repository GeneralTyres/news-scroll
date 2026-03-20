# Adding a new entity to the war map

**1. Filter config** — `lib/war-map/warMapFilter.config.ts`  
Add an entry to `WAR_MAP_FILTER_ENTITY_CONFIGS`:

- `key` — e.g. `"ships"` (used for filter state and `filterEntities`)
- `label` — UI label in the filter panel
- `typeField` — property on the entity that holds the type (e.g. `"type"`, `"type_now"`)
- `options` — `{ value, label }[]` for each filterable type

**2. Marker module** — `lib/war-map/markers/<entity>Markers.ts`  
Create `createXxxMarker(item, map): Marker | null`. Use `lib/war-map/markers/militaryBaseMarkers.ts` as reference (styles, popup, `addTo(map)`). Export from `lib/war-map/markers/index.ts`.

**3. MapView** — `components/war-map/WarMapView.tsx`  
- Add prop, e.g. `ships: Ship[]`.
- Add a ref for the new layer’s markers.
- In the sync effect: clear old markers, then create markers (add **after** existing location layers so they render on top). Append points to the initial `fitMapToPoints` array when doing the first fit.

**4. Page client** — `components/war-map/WarMapPageClient.tsx`  
- Add data prop and `filteredShips = useMemo(() => filterEntities<Ship>("ships", ships, filterState), [ships, filterState])`.
- Pass `filteredShips` into `MapView`.

**5. Data**  
- Add a type (e.g. `types/ship.ts`) and fetch in a service if needed.
- In `app/war-map/[id]/page.tsx`, load the data and pass it into `MapPageClient`.

Filter UI and “filter by type” behavior come from the config; no extra filter code needed.
