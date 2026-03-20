"use client";

import { cn } from "@/lib/utils";
import {
  WAR_MAP_FILTER_ENTITY_CONFIGS,
  toggleFilterOption,
  setEntityFilterEnabled,
  isEntityFullyEnabled,
  isEntityFullyDisabled,
  type WarMapFilterState,
  type WarMapFilterEntityConfig,
} from "@/lib/war-map/warMapFilter.config";

interface WarMapFilterProps {
  filterState: WarMapFilterState;
  onFilterChange: (next: WarMapFilterState) => void;
  className?: string;
}

export function WarMapFilter({ filterState, onFilterChange, className }: WarMapFilterProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-zinc-700/50 bg-zinc-900/90 p-3 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">Locations</div>
      <div className="flex flex-col gap-3">
        {WAR_MAP_FILTER_ENTITY_CONFIGS.map((config) => (
          <EntityFilterSection
            key={config.key}
            config={config}
            state={filterState}
            onFilterChange={onFilterChange}
          />
        ))}
      </div>
    </div>
  );
}

function EntityFilterSection({
  config,
  state,
  onFilterChange,
}: {
  config: WarMapFilterEntityConfig;
  state: WarMapFilterState;
  onFilterChange: (next: WarMapFilterState) => void;
}) {
  const set = state[config.key];
  const allEnabled = isEntityFullyEnabled(config, state);
  const noneEnabled = isEntityFullyDisabled(config, state);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-zinc-200">{config.label}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onFilterChange(setEntityFilterEnabled(config, state, true))}
            className={cn(
              "rounded px-2 py-0.5 text-xs transition-colors",
              allEnabled
                ? "bg-zinc-600 text-white"
                : "text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onFilterChange(setEntityFilterEnabled(config, state, false))}
            className={cn(
              "rounded px-2 py-0.5 text-xs transition-colors",
              noneEnabled
                ? "bg-zinc-600 text-white"
                : "text-zinc-400 hover:bg-zinc-700/80 hover:text-zinc-200"
            )}
          >
            None
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {config.options.map((opt) => {
          const checked = !set || set.size === 0 || set.has(opt.value);
          return (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-1.5 text-sm text-zinc-300 hover:text-zinc-100"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) =>
                  onFilterChange(toggleFilterOption(state, config.key, opt.value, e.target.checked))
                }
                className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-zinc-500"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
