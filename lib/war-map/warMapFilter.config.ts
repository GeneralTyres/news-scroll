/**
 * Config for war map location filters. Add new entity kinds here when we load more data.
 * Each kind has a type field and a list of options to filter by.
 */
export interface WarMapFilterOption {
  value: string;
  label: string;
}

export interface WarMapFilterEntityConfig {
  /** Key used in filter state and when applying filter to data */
  key: string;
  /** Display name in the filter UI */
  label: string;
  /** Field on the entity that holds the type (e.g. type_now, type) */
  typeField: string;
  options: WarMapFilterOption[];
}

export const WAR_MAP_FILTER_ENTITY_CONFIGS: WarMapFilterEntityConfig[] = [
  {
    key: "events",
    label: "Events",
    typeField: "type",
    options: [
      { value: "armed-conflict", label: "Armed conflict" },
      { value: "missle-strike", label: "Missile strike" },
      { value: "air-strike", label: "Air strike" },
      { value: "ground-battle", label: "Ground battle" },
      { value: "protest", label: "Protest" },
      { value: "other", label: "Other" },
    ],
  },
  {
    key: "militaryBases",
    label: "Military bases",
    typeField: "type_now",
    options: [
      { value: "Ground Base", label: "Ground" },
      { value: "Naval Base", label: "Naval" },
      { value: "Air Base", label: "Air" },
      { value: "Missile Base", label: "Missile" },
      { value: "Major Base", label: "Major" },
      { value: "Logistics Base", label: "Major" },
      { value: "Other", label: "Other" },
    ],
  },
];

/** Per-entity: set of type values that are enabled. Empty = show all. */
export type WarMapFilterState = Record<string, Set<string>>;

export function getDefaultFilterState(): WarMapFilterState {
  const state: WarMapFilterState = {};
  for (const config of WAR_MAP_FILTER_ENTITY_CONFIGS) {
    state[config.key] = new Set(config.options.map((o) => o.value));
  }
  return state;
}

export function isFilterOptionEnabled(state: WarMapFilterState, entityKey: string, typeValue: string | null): boolean {
  const set = state[entityKey];
  if (!set || set.size === 0) return true;
  if (typeValue == null) return true;
  return set.has(typeValue);
}

/** Generic filter: uses entity config typeField. Add new entities in config only. */
export function filterEntities<T>(entityKey: string, items: T[], state: WarMapFilterState): T[] {
  const config = WAR_MAP_FILTER_ENTITY_CONFIGS.find((c) => c.key === entityKey);
  if (!config) return items;
  const typeField = config.typeField;
  return items.filter((item) => {
    const typeVal = (item as Record<string, unknown>)[typeField];
    return isFilterOptionEnabled(state, entityKey, (typeVal as string | null | undefined) ?? null);
  });
}

// --- Filter state transitions (pure, no React) ---

export function toggleFilterOption(
  state: WarMapFilterState,
  entityKey: string,
  typeValue: string,
  enabled: boolean
): WarMapFilterState {
  const config = WAR_MAP_FILTER_ENTITY_CONFIGS.find((c) => c.key === entityKey);
  if (!config) return state;
  const next = { ...state };
  const set = new Set(next[entityKey] ?? config.options.map((o) => o.value));
  if (enabled) set.add(typeValue);
  else set.delete(typeValue);
  next[entityKey] = set;
  return next;
}

export function setEntityFilterEnabled(
  config: WarMapFilterEntityConfig,
  state: WarMapFilterState,
  enabled: boolean
): WarMapFilterState {
  const next = { ...state };
  next[config.key] = enabled ? new Set(config.options.map((o) => o.value)) : new Set();
  return next;
}

export function isEntityFullyEnabled(config: WarMapFilterEntityConfig, state: WarMapFilterState): boolean {
  const set = state[config.key];
  if (!set) return true;
  return set.size === config.options.length;
}

export function isEntityFullyDisabled(config: WarMapFilterEntityConfig, state: WarMapFilterState): boolean {
  const set = state[config.key];
  return !set || set.size === 0;
}
