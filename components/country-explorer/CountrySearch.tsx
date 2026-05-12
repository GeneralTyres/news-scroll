"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CountryWithBoundarySimple } from "@/types/countries";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 4;

export interface CountrySearchProps {
  countries: ReadonlyArray<CountryWithBoundarySimple>;
  onSelect: (countryId: number) => void;
}

/**
 * Autocomplete for countries: filters by name, shows up to 4 matches, selects on pick.
 */
export function CountrySearch(props: Readonly<CountrySearchProps>) {
  const { countries, onSelect } = props;
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!normalizedQuery) return [];
    return countries
      .filter((c) => c.name.toLowerCase().includes(normalizedQuery))
      .slice(0, MAX_RESULTS);
  }, [countries, normalizedQuery]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const handleSelect = useCallback(
    (countryId: number) => {
      onSelect(countryId);
      setQuery("");
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <div ref={rootRef}>
      <Input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="Search country…"
        className="border-zinc-700 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500"
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul
          className={cn(
            "absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-zinc-700 bg-zinc-900 py-1 text-sm shadow-lg"
          )}
        >
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => handleSelect(c.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-2 py-1.5 text-left text-zinc-300",
                  "hover:bg-zinc-800/80 hover:text-zinc-100"
                )}
              >
                <span>{c.emoji}</span>
                <span className="truncate">{c.name}</span>
                {!c.boundary_simple && (
                  <span className="ml-auto shrink-0 text-[10px] text-zinc-600">no poly</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
