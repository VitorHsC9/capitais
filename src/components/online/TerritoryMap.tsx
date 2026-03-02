import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// ─── GeoJSON World Map Component ────────────────────────────────
// Interactive world map with zoom/pan. Target country highlighted.
// Uses equirectangular projection. No external dependencies.

const GEO_JSON_URL = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json';

// ISO alpha-2 (lowercase) → alpha-3 (uppercase)
const A2_TO_A3: Record<string, string> = {
    af: 'AFG', al: 'ALB', dz: 'DZA', as: 'ASM', ad: 'AND', ao: 'AGO', ai: 'AIA', aq: 'ATA',
    ag: 'ATG', ar: 'ARG', am: 'ARM', aw: 'ABW', au: 'AUS', at: 'AUT', az: 'AZE', bs: 'BHS',
    bh: 'BHR', bd: 'BGD', bb: 'BRB', by: 'BLR', be: 'BEL', bz: 'BLZ', bj: 'BEN', bm: 'BMU',
    bt: 'BTN', bo: 'BOL', ba: 'BIH', bw: 'BWA', br: 'BRA', bn: 'BRN', bg: 'BGR', bf: 'BFA',
    bi: 'BDI', kh: 'KHM', cm: 'CMR', ca: 'CAN', cv: 'CPV', cf: 'CAF', td: 'TCD', cl: 'CHL',
    cn: 'CHN', co: 'COL', km: 'COM', cg: 'COG', cd: 'COD', cr: 'CRI', ci: 'CIV', hr: 'HRV',
    cu: 'CUB', cy: 'CYP', cz: 'CZE', dk: 'DNK', dj: 'DJI', dm: 'DMA', do: 'DOM', ec: 'ECU',
    eg: 'EGY', sv: 'SLV', gq: 'GNQ', er: 'ERI', ee: 'EST', et: 'ETH', fj: 'FJI', fi: 'FIN',
    fr: 'FRA', ga: 'GAB', gm: 'GMB', ge: 'GEO', de: 'DEU', gh: 'GHA', gr: 'GRC', gd: 'GRD',
    gt: 'GTM', gn: 'GIN', gw: 'GNB', gy: 'GUY', ht: 'HTI', hn: 'HND', hu: 'HUN', is: 'ISL',
    in: 'IND', id: 'IDN', ir: 'IRN', iq: 'IRQ', ie: 'IRL', il: 'ISR', it: 'ITA', jm: 'JAM',
    jp: 'JPN', jo: 'JOR', kz: 'KAZ', ke: 'KEN', ki: 'KIR', kp: 'PRK', kr: 'KOR', kw: 'KWT',
    kg: 'KGZ', la: 'LAO', lv: 'LVA', lb: 'LBN', ls: 'LSO', lr: 'LBR', ly: 'LBY', li: 'LIE',
    lt: 'LTU', lu: 'LUX', mk: 'MKD', mg: 'MDG', mw: 'MWI', my: 'MYS', mv: 'MDV', ml: 'MLI',
    mt: 'MLT', mh: 'MHL', mr: 'MRT', mu: 'MUS', mx: 'MEX', fm: 'FSM', md: 'MDA', mc: 'MCO',
    mn: 'MNG', me: 'MNE', ma: 'MAR', mz: 'MOZ', mm: 'MMR', na: 'NAM', nr: 'NRU', np: 'NPL',
    nl: 'NLD', nz: 'NZL', ni: 'NIC', ne: 'NER', ng: 'NGA', no: 'NOR', om: 'OMN', pk: 'PAK',
    pw: 'PLW', pa: 'PAN', pg: 'PNG', py: 'PRY', pe: 'PER', ph: 'PHL', pl: 'POL', pt: 'PRT',
    qa: 'QAT', ro: 'ROU', ru: 'RUS', rw: 'RWA', kn: 'KNA', lc: 'LCA', vc: 'VCT', ws: 'WSM',
    sm: 'SMR', st: 'STP', sa: 'SAU', sn: 'SEN', rs: 'SRB', sc: 'SYC', sl: 'SLE', sg: 'SGP',
    sk: 'SVK', si: 'SVN', sb: 'SLB', so: 'SOM', za: 'ZAF', es: 'ESP', lk: 'LKA', sd: 'SDN',
    sr: 'SUR', sz: 'SWZ', se: 'SWE', ch: 'CHE', sy: 'SYR', tw: 'TWN', tj: 'TJK', tz: 'TZA',
    th: 'THA', tl: 'TLS', tg: 'TGO', to: 'TON', tt: 'TTO', tn: 'TUN', tr: 'TUR', tm: 'TKM',
    tv: 'TUV', ug: 'UGA', ua: 'UKR', ae: 'ARE', gb: 'GBR', us: 'USA', uy: 'URY', uz: 'UZB',
    vu: 'VUT', ve: 'VEN', vn: 'VNM', ye: 'YEM', zm: 'ZMB', zw: 'ZWE', ss: 'SSD', xk: 'XKX',
    ps: 'PSE', hk: 'HKG', mo: 'MAC', pr: 'PRI', gp: 'GLP', mq: 'MTQ', re: 'REU', yt: 'MYT',
    nc: 'NCL', pf: 'PYF', gf: 'GUF', ck: 'COK', eh: 'ESH', cx: 'CXR', cc: 'CCK',
};

interface GeoFeature {
    id: string;
    type: string;
    properties: { name: string };
    geometry: {
        type: string;
        coordinates: number[][][] | number[][][][];
    };
}

interface GeoJson {
    type: string;
    features: GeoFeature[];
}

// Cache
let geoJsonCache: GeoJson | null = null;
let fetchPromise: Promise<GeoJson> | null = null;

async function loadGeoJson(): Promise<GeoJson> {
    if (geoJsonCache) return geoJsonCache;
    if (fetchPromise) return fetchPromise;
    fetchPromise = fetch(GEO_JSON_URL)
        .then(r => r.json())
        .then((data: GeoJson) => { geoJsonCache = data; return data; });
    return fetchPromise;
}

// Map dimensions
const W = 800;
const H = 450;

// Equirectangular projection
function project(lon: number, lat: number): [number, number] {
    return [(lon + 180) * (W / 360), (90 - lat) * (H / 180)];
}

function ringToPath(ring: number[][]): string {
    return ring.map(([lon, lat], i) => {
        const [x, y] = project(lon, lat);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join('') + 'Z';
}

function geometryToPath(geometry: GeoFeature['geometry']): string {
    if (geometry.type === 'Polygon') {
        return (geometry.coordinates as number[][][]).map(ring => ringToPath(ring)).join(' ');
    }
    if (geometry.type === 'MultiPolygon') {
        return (geometry.coordinates as number[][][][])
            .map(polygon => polygon.map(ring => ringToPath(ring)).join(' ')).join(' ');
    }
    return '';
}

// Pre-compute paths (memoized outside component)
let pathCache: Map<string, string> = new Map();

function getFeaturePath(feature: GeoFeature): string {
    const cached = pathCache.get(feature.id);
    if (cached) return cached;
    const path = geometryToPath(feature.geometry);
    pathCache.set(feature.id, path);
    return path;
}

interface TerritoryMapProps {
    countryCode: string;
    className?: string;
}

export const TerritoryMap = memo(function TerritoryMap({ countryCode, className }: TerritoryMapProps) {
    const [geoData, setGeoData] = useState<GeoJson | null>(geoJsonCache);
    const [loading, setLoading] = useState(!geoJsonCache);

    // Zoom/Pan state
    const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: W, h: H });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0, vbx: 0, vby: 0 });
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Touch state for pinch zoom
    const lastTouchDist = useRef<number | null>(null);

    const targetAlpha3 = A2_TO_A3[countryCode.toLowerCase()] || countryCode.toUpperCase();

    useEffect(() => {
        if (geoJsonCache) { setGeoData(geoJsonCache); setLoading(false); return; }
        loadGeoJson().then(data => { setGeoData(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    // Reset view when country changes
    useEffect(() => {
        setViewBox({ x: 0, y: 0, w: W, h: H });
    }, [countryCode]);

    // ── Zoom ────────────────────────────────────────────────────
    const zoom = useCallback((factor: number, centerX?: number, centerY?: number) => {
        setViewBox(prev => {
            const newW = Math.max(50, Math.min(W, prev.w * factor));
            const newH = Math.max(28, Math.min(H, prev.h * factor));

            // Zoom toward center point (default: center of current view)
            const cx = centerX ?? (prev.x + prev.w / 2);
            const cy = centerY ?? (prev.y + prev.h / 2);
            const newX = cx - (cx - prev.x) * (newW / prev.w);
            const newY = cy - (cy - prev.y) * (newH / prev.h);

            return {
                x: Math.max(0, Math.min(W - newW, newX)),
                y: Math.max(0, Math.min(H - newH, newY)),
                w: newW,
                h: newH,
            };
        });
    }, []);

    const resetView = useCallback(() => {
        setViewBox({ x: 0, y: 0, w: W, h: H });
    }, []);

    // ── Mouse events ────────────────────────────────────────────
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Convert mouse position to SVG coordinates
        const mouseX = viewBox.x + ((e.clientX - rect.left) / rect.width) * viewBox.w;
        const mouseY = viewBox.y + ((e.clientY - rect.top) / rect.height) * viewBox.h;

        const factor = e.deltaY > 0 ? 1.15 : 0.85;
        zoom(factor, mouseX, mouseY);
    }, [zoom, viewBox]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY, vbx: viewBox.x, vby: viewBox.y };
    }, [viewBox]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const dx = (e.clientX - dragStart.current.x) / rect.width * viewBox.w;
        const dy = (e.clientY - dragStart.current.y) / rect.height * viewBox.h;

        setViewBox(prev => ({
            ...prev,
            x: Math.max(0, Math.min(W - prev.w, dragStart.current.vbx - dx)),
            y: Math.max(0, Math.min(H - prev.h, dragStart.current.vby - dy)),
        }));
    }, [isDragging, viewBox.w, viewBox.h]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // ── Touch events (pinch zoom + drag) ────────────────────────
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            setIsDragging(true);
            dragStart.current = { x: touch.clientX, y: touch.clientY, vbx: viewBox.x, vby: viewBox.y };
        }
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDist.current = Math.sqrt(dx * dx + dy * dy);
        }
    }, [viewBox]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.preventDefault();

        if (e.touches.length === 1 && isDragging) {
            const touch = e.touches[0];
            const rect = svgRef.current?.getBoundingClientRect();
            if (!rect) return;
            const dx = (touch.clientX - dragStart.current.x) / rect.width * viewBox.w;
            const dy = (touch.clientY - dragStart.current.y) / rect.height * viewBox.h;

            setViewBox(prev => ({
                ...prev,
                x: Math.max(0, Math.min(W - prev.w, dragStart.current.vbx - dx)),
                y: Math.max(0, Math.min(H - prev.h, dragStart.current.vby - dy)),
            }));
        }

        if (e.touches.length === 2 && lastTouchDist.current !== null) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const factor = lastTouchDist.current / dist;
            lastTouchDist.current = dist;
            zoom(factor);
        }
    }, [isDragging, viewBox, zoom]);

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        lastTouchDist.current = null;
    }, []);

    if (loading || !geoData) {
        return (
            <div className={`flex items-center justify-center rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-color)] ${className || ''}`}
                style={{ height: '180px', maxWidth: '100%' }}>
                <div className="animate-pulse text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest">
                    Carregando mapa...
                </div>
            </div>
        );
    }

    const isZoomed = viewBox.w < W * 0.95;

    return (
        <div className={`relative ${className || ''}`} ref={containerRef} style={{ maxWidth: '100%', touchAction: 'none' }}>
            <svg
                ref={svgRef}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
                className="w-full rounded-lg border-2 border-[var(--border-color)] bg-[var(--bg-color)] select-none"
                style={{ maxHeight: '200px', cursor: isDragging ? 'grabbing' : 'grab' }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Ocean background */}
                <rect x="0" y="0" width={W} height={H} fill="var(--bg-color)" />

                {/* All countries */}
                {geoData.features.map((feature) => {
                    const isTarget = feature.id === targetAlpha3;
                    const pathD = getFeaturePath(feature);
                    if (!pathD) return null;

                    return (
                        <path
                            key={feature.id}
                            d={pathD}
                            fill={isTarget ? 'var(--color-primary)' : 'var(--surface-color)'}
                            stroke={isTarget ? 'var(--color-accent)' : 'var(--border-color)'}
                            strokeWidth={isTarget ? Math.max(0.5, viewBox.w / W * 1.5) : Math.max(0.1, viewBox.w / W * 0.3)}
                            opacity={isTarget ? 1 : 0.6}
                            style={isTarget ? { filter: 'drop-shadow(0 0 4px var(--color-primary))' } : undefined}
                        />
                    );
                })}
            </svg>

            {/* Zoom Controls */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-1">
                <button
                    onClick={() => zoom(0.7)}
                    className="w-7 h-7 rounded-md bg-[var(--surface-color)]/90 backdrop-blur border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
                    title="Zoom in"
                >
                    <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={() => zoom(1.4)}
                    className="w-7 h-7 rounded-md bg-[var(--surface-color)]/90 backdrop-blur border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all"
                    title="Zoom out"
                >
                    <ZoomOut className="w-3.5 h-3.5" />
                </button>
                {isZoomed && (
                    <button
                        onClick={resetView}
                        className="w-7 h-7 rounded-md bg-[var(--color-primary)]/20 backdrop-blur border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)] active:scale-95 transition-all animate-in fade-in duration-200"
                        title="Reset view"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Zoom hint */}
            {!isZoomed && (
                <div className="absolute bottom-2 left-2 text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider opacity-60">
                    🔍 Pinça ou scroll para zoom
                </div>
            )}
        </div>
    );
});
