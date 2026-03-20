const svgCache = new Map<string, string>();

export async function fetchSvg(svgPath: string): Promise<string> {
  const cached = svgCache.get(svgPath);
  if (cached) return cached;
  const res = await fetch(svgPath);
  if (!res.ok) throw new Error(`Failed to fetch SVG: ${svgPath}`);
  const text = await res.text();
  svgCache.set(svgPath, text);
  return text;
}

const MARKER_SIZE = 14;
const BORDER_WIDTH = 2;

export async function buildSVGMarkerElement(
  color: string,
  svgPath: string,
  className = "location-marker"
): Promise<HTMLDivElement> {
  const outerSize = MARKER_SIZE + BORDER_WIDTH * 2;

  const wrapper = document.createElement("div");
  wrapper.className = className;
  wrapper.style.cssText = `
    width: ${outerSize}px;
    height: ${outerSize}px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-sizing: border-box;
    transform-origin: center center;
    will-change: transform;
  `;

  const svgText = await fetchSvg(svgPath);
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const sourceSvg = doc.querySelector("svg");
  const sourcePaths = doc.querySelectorAll("path[d]");

  if (!sourceSvg || sourcePaths.length === 0) {
    throw new Error(`Invalid SVG structure in ${svgPath}`);
  }

  const viewBox = sourceSvg.getAttribute("viewBox") ?? "0 0 24 24";
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);
  const vbMin = Math.min(vbW, vbH);
  const strokeWidth = vbMin * 0.02;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", String(MARKER_SIZE));
  svg.setAttribute("height", String(MARKER_SIZE));
  svg.style.display = "block";
  svg.style.transformOrigin = "center center";

  for (const sourcePath of sourcePaths) {
    const pathElement = document.createElementNS(svgNS, "path");
    pathElement.setAttribute("d", sourcePath.getAttribute("d") ?? "");
    pathElement.setAttribute("fill", color);
    pathElement.setAttribute("stroke", "rgba(255,255,255,0.9)");
    pathElement.setAttribute("stroke-width", String(strokeWidth));
    pathElement.setAttribute("stroke-linejoin", "round");
    svg.appendChild(pathElement);
  }

  wrapper.appendChild(svg);
  return wrapper;
}
