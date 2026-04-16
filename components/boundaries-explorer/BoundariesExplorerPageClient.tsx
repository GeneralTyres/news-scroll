"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import { BoundariesExplorerMapView } from "./BoundariesExplorerMapView";
import {
  fetchBoundaryChildrenForCountry,
  fetchBoundaryChildrenForState,
} from "@/app/boundries-explorer/actions";

export type ExplorerStackEntry = {
  kind: "world" | "country" | "state";
  id: number;
  name: string;
  features: FeatureCollection;
};

function findFeatureName(fc: FeatureCollection, id: number): string {
  for (const f of fc.features) {
    const raw = f.properties?.id;
    const pid = typeof raw === "number" ? raw : Number(raw);
    if (Number.isFinite(pid) && pid === id) {
      const n = f.properties?.name;
      return typeof n === "string" ? n : n != null ? String(n) : "Unknown";
    }
  }
  return "Unknown";
}

function isEmptyFc(fc: FeatureCollection): boolean {
  return fc.features.length === 0;
}

export interface BoundariesExplorerPageClientProps {
  initialFeatureCollection: FeatureCollection;
}

export function BoundariesExplorerPageClient({
  initialFeatureCollection,
}: Readonly<BoundariesExplorerPageClientProps>) {
  const [stack, setStack] = useState<ExplorerStackEntry[]>(() => [
    {
      kind: "world",
      id: 0,
      name: "World",
      features: initialFeatureCollection,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const stackRef = useRef(stack);
  stackRef.current = stack;

  const current = stack[stack.length - 1];
  const breadcrumb = useMemo(() => stack.map((e) => e.name).join(" → "), [stack]);

  const handleBack = useCallback(() => {
    setNotice(null);
    if (stack.length <= 1) return;
    setStack((s) => s.slice(0, -1));
  }, [stack.length]);

  const handlePolygonClick = useCallback(async (id: number) => {
    setNotice(null);
    const top = stackRef.current[stackRef.current.length - 1];
    const pickedName = findFeatureName(top.features, id);

    setLoading(true);
    try {
      if (top.kind === "world") {
        const fc = await fetchBoundaryChildrenForCountry(id);
        if (isEmptyFc(fc)) {
          setNotice(`No state boundaries in DB for "${pickedName}" (or all missing geometry).`);
          return;
        }
        setStack((s) => [...s, { kind: "country", id, name: pickedName, features: fc }]);
        return;
      }

      const fc = await fetchBoundaryChildrenForState(id);
      if (isEmptyFc(fc)) {
        setNotice(`No child boundaries in DB for "${pickedName}" (leaf or missing geometry).`);
        return;
      }
      setStack((s) => [...s, { kind: "state", id, name: pickedName, features: fc }]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="relative h-screen w-full">
      {loading && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/20">
          <div className="rounded-md bg-zinc-900/90 px-4 py-2 text-sm text-zinc-100 shadow">
            Loading…
          </div>
        </div>
      )}

      <div className="absolute left-3 top-3 z-20 flex max-w-[min(480px,calc(100%-1.5rem))] flex-col gap-2">
        <div className="rounded-md border border-zinc-700 bg-zinc-950/95 px-3 py-2 text-sm text-zinc-100 shadow">
          <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">Current</div>
          <div className="mt-1 break-words font-medium leading-snug">{breadcrumb}</div>
        </div>
        <button
          type="button"
          onClick={handleBack}
          disabled={stack.length <= 1 || loading}
          className="w-fit rounded-md border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 shadow hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Back
        </button>
        {notice && (
          <div className="rounded-md border border-amber-700/80 bg-amber-950/95 px-3 py-2 text-xs text-amber-100 shadow">
            {notice}
          </div>
        )}
      </div>

      <BoundariesExplorerMapView features={current.features} onPolygonClick={handlePolygonClick} />
    </div>
  );
}
