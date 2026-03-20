import maplibregl from "maplibre-gl";

export const MAPLIBRE_DEFAULT_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const MAPLIBRE_DEFAULT_CENTER: [number, number] = [20, 30];
export const MAPLIBRE_DEFAULT_ZOOM = 2;

export interface CreateMapOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
}

/**
 * Shared MapLibre setup for war map, power plants, country explorer.
 */
export function createMapInContainer(
  container: HTMLElement,
  options: CreateMapOptions = {}
): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: options.style ?? MAPLIBRE_DEFAULT_STYLE,
    center: options.center ?? MAPLIBRE_DEFAULT_CENTER,
    zoom: options.zoom ?? MAPLIBRE_DEFAULT_ZOOM,
  });
  map.addControl(new maplibregl.NavigationControl(), "bottom-right");
  return map;
}
