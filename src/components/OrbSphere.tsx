import { useEffect, useRef } from 'react';

const POINTS = 300; // fallback dot count, used only until the map data loads
const PULSE_MS = 1600;
const SAMPLE_DEG = 3; // grid spacing for land dots, in degrees
const BORDER_STRIDE = 3; // keep every Nth border vertex so the border dots stay light
// World map data (Natural Earth 110m, as TopoJSON). Loaded once in the browser.
// To host it yourself, download the file into /public and point this at '/countries-110m.json'.
const MAP_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Fibonacci sphere: spreads the dots evenly over a unit sphere (fallback shape)
const FALLBACK: [number, number, number][] = (() => {
  const pts: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < POINTS; i++) {
    const y = 1 - (i / (POINTS - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = golden * i;
    pts.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  return pts;
})();

// Latitude and longitude to a point on the unit sphere
function toVector(lat: number, lon: number): [number, number, number] {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Ring = [number, number][]; // [lon, lat] pairs
type Poly = { rings: Ring[]; box: [number, number, number, number] }; // box: minLon, minLat, maxLon, maxLat
type Geo = { land: [number, number, number][]; borders: [number, number, number][] };

// Decode the TopoJSON arcs (quantized, delta-encoded) into plain [lon, lat] lines
function decodeArcs(topo: any): Ring[] {
  const t = topo.transform ?? { scale: [1, 1], translate: [0, 0] };
  return (topo.arcs as number[][][]).map((arc) => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => {
      x += dx;
      y += dy;
      return [x * t.scale[0] + t.translate[0], y * t.scale[1] + t.translate[1]] as [number, number];
    });
  });
}

// Join a list of arc indices into one ring. A negative index means the arc runs backwards.
function joinArcs(indices: number[], arcs: Ring[]): Ring {
  const out: Ring = [];
  for (const i of indices) {
    const a = i >= 0 ? arcs[i] : [...arcs[~i]].reverse();
    for (let k = out.length ? 1 : 0; k < a.length; k++) out.push(a[k]);
  }
  return out;
}

const flatten = (x: any): number[] => (Array.isArray(x) ? x.flatMap(flatten) : [x]);

function decodeMap(topo: any): Geo {
  const arcs = decodeArcs(topo);

  // Land polygons: each polygon is a list of rings (outer ring first, holes after)
  const polys: Poly[] = [];
  const land = topo.objects.land;
  const polyRings: number[][][][] =
    land.type === 'MultiPolygon' ? land.arcs : land.type === 'Polygon' ? [land.arcs] : [];
  for (const rings of polyRings) {
    const decoded = rings.map((r) => joinArcs(r, arcs));
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    for (const [x, y] of decoded[0]) {
      if (x < minLon) minLon = x;
      if (x > maxLon) maxLon = x;
      if (y < minLat) minLat = y;
      if (y > maxLat) maxLat = y;
    }
    polys.push({ rings: decoded, box: [minLon, minLat, maxLon, maxLat] });
  }

  // Country borders: every arc used by a country shape, drawn as a line of points
  const used = new Set<number>();
  for (const g of topo.objects.countries.geometries as any[]) {
    for (const i of flatten(g.arcs ?? [])) used.add(i < 0 ? ~i : i);
  }

  const inside = (lon: number, lat: number) => {
    for (const p of polys) {
      const [minLon, minLat, maxLon, maxLat] = p.box;
      if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) continue;
      let c = false;
      for (const ring of p.rings) {
        for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
          const [xi, yi] = ring[i];
          const [xj, yj] = ring[j];
          if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
        }
      }
      if (c) return true; // even-odd across rings also handles lakes and holes
    }
    return false;
  };

  const landDots: [number, number, number][] = [];
  for (let lat = -60; lat <= 84; lat += SAMPLE_DEG) {
    for (let lon = -180; lon < 180; lon += SAMPLE_DEG) {
      if (inside(lon, lat)) landDots.push(toVector(lat, lon));
    }
  }

  const borders: [number, number, number][] = [];
  for (const i of used) {
    const arc = arcs[i];
    for (let k = 0; k < arc.length; k += BORDER_STRIDE) {
      const [lon, lat] = arc[k];
      borders.push(toVector(lat, lon));
    }
  }

  return { land: landDots, borders };
}

// Loaded once and shared by every globe on the page
let mapPromise: Promise<Geo | null> | null = null;
function loadMap(): Promise<Geo | null> {
  if (!mapPromise) {
    mapPromise = fetch(MAP_URL)
      .then((r) => {
        if (!r.ok) throw new Error('map request failed');
        return r.json();
      })
      .then((topo) => decodeMap(topo))
      .catch(() => null); // on failure the globe keeps the plain dot sphere
  }
  return mapPromise;
}

export type GlobeMarker = { lat: number; lon: number };

// A globe drawn from dots on a plain canvas. Land is dotted, country borders are drawn as lighter dots,
// and it keeps turning and tilts toward the mouse. Hovering or clicking lights the dots in the accent
// color, and the Konami code makes it spin faster. An optional marker pins a place with a pulsing accent dot.
// Until the map loads, it shows the plain dot sphere.
// Reduced motion: drawn once and still. Mouse tilt only with a fine pointer.
export default function OrbSphere({ size = 120, marker }: { size?: number; marker?: GlobeMarker }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Read through a ref so a new marker object doesn't restart the animation
  const markerRef = useRef(marker);
  markerRef.current = marker;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const aim = { x: 0, y: 0 }; // mouse offset, -1 to 1
    const tilt = { x: 0, y: 0 }; // eased toward aim
    let spin = 0;
    let boost = 0; // extra spin from clicks and the Konami code
    let hover = false;
    let clock = 0;
    let last = performance.now();
    let raf = 0;
    let geo: Geo | null = null; // set when the map arrives
    let cancelled = false;

    // Fetch and decode the map only once the globe is near the screen, and off the critical path
    let io: IntersectionObserver | null = null;
    const startMap = () => {
      io?.disconnect();
      const run = () =>
        loadMap().then((g) => {
          if (!cancelled && g) {
            geo = g;
            if (reduce) draw();
          }
        });
      if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 1500 });
      else window.setTimeout(run, 0);
    };
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) startMap();
        },
        { rootMargin: '300px' },
      );
      io.observe(canvas);
    } else {
      startMap();
    }

    const draw = () => {
      const dark = document.documentElement.classList.contains('dark');
      const base = dark ? '245,245,245' : '23,23,23';
      const accent = dark ? '96,165,250' : '37,99,235';
      const rgb = hover ? accent : base;

      ctx.clearRect(0, 0, size, size);
      const R = size * 0.42;
      const rotY = spin + tilt.x * 0.7;
      const rotX = -0.3 + tilt.y * 0.6;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Rotate a point, then project it onto the canvas. z2 > 0 means it faces the viewer.
      const project = (px: number, py: number, pz: number) => {
        const x1 = px * cosY + pz * sinY;
        const z1 = -px * sinY + pz * cosY;
        const y2 = py * cosX - z1 * sinX;
        const z2 = py * sinX + z1 * cosX;
        return { x: size / 2 + x1 * R, y: size / 2 + y2 * R, z: z2 };
      };

      // Faint outline so the globe still reads as a sphere
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, R, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb},0.1)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (geo) {
        for (const [px, py, pz] of geo.borders) {
          const p = project(px, py, pz);
          if (p.z <= -0.2) continue; // skip the far side, it is hidden anyway
          const depth = (p.z + 1) / 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.45 + depth * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${0.15 + depth * 0.45})`;
          ctx.fill();
        }
        for (const [px, py, pz] of geo.land) {
          const p = project(px, py, pz);
          if (p.z <= -0.2) continue;
          const depth = (p.z + 1) / 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.5 + depth * 1.0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${0.2 + depth * 0.8})`;
          ctx.fill();
        }
      } else {
        for (const [px, py, pz] of FALLBACK) {
          const p = project(px, py, pz);
          const depth = (p.z + 1) / 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 0.6 + depth * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb},${0.12 + depth * 0.88})`;
          ctx.fill();
        }
      }

      const m = markerRef.current;
      if (m) {
        const [vx, vy, vz] = toVector(m.lat, m.lon);
        const p = project(vx, vy, vz);
        if (p.z > 0) {
          const phase = (clock % PULSE_MS) / PULSE_MS;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5 + phase * 6, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${accent},${0.6 * (1 - phase)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${accent})`;
          ctx.fill();
        }
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      clock = now;
      spin += (0.35 + boost * 3) * dt;
      boost = Math.max(0, boost - dt * 0.9);
      tilt.x += (aim.x - tilt.x) * 0.08;
      tilt.y += (aim.y - tilt.y) * 0.08;
      draw();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const r = canvas.getBoundingClientRect();
      aim.x = clamp((e.clientX - (r.left + r.width / 2)) / 300, -1, 1);
      aim.y = clamp((e.clientY - (r.top + r.height / 2)) / 300, -1, 1);
    };
    const onEnter = () => {
      hover = true;
      if (reduce) draw();
    };
    const onLeave = () => {
      hover = false;
      if (reduce) draw();
    };
    const onDown = () => {
      boost = 1;
    };
    const onKonami = () => {
      boost = 4;
    };

    canvas.addEventListener('pointerenter', onEnter);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('konami', onKonami);
    if (fine && !reduce) window.addEventListener('pointermove', onMove);

    if (reduce) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerenter', onEnter);
      canvas.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('pointerdown', onDown);
      window.removeEventListener('konami', onKonami);
      window.removeEventListener('pointermove', onMove);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-cursor="spin"
      style={{ width: size, height: size }}
      className="block"
    />
  );
}
