import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Highlight {
    code: string;
    mapName?: string;
    status: 'partial' | 'full';
}

interface MultiCountryMapProps {
    highlights: Highlight[];
}

function MapUpdater({ highlights, geoJsonData }: { highlights: Highlight[], geoJsonData: any }) {
    const map = useMap();

    useEffect(() => {
        if (!highlights.length || !geoJsonData || !map) return;

        // Optional: Auto-zoom to fit all highlighted countries?
        // For now, let's keep the world view or maybe fit bounds of all highlights if needed.
        // But since it's a "fill the map" game, keeping the world view might be better.

    }, [highlights, geoJsonData, map]);

    return null;
}

export function MultiCountryMap({ highlights }: MultiCountryMapProps) {
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [loadingMap, setLoadingMap] = useState(true);

    useEffect(() => {
        fetch('/assets/world.geo.json')
            .then(res => res.json())
            .then(data => {
                setGeoJsonData(data);
                setLoadingMap(false);
            })
            .catch(err => {
                console.error("Failed to load map data", err);
                setLoadingMap(false);
            });
    }, []);

    // Memoize style function to avoid re-renders if not needed
    const styleFunction = useMemo(() => {
        return (feature: any) => {
            const props = feature?.properties || {};
            const iso = props.iso_a2 || props.ISO_A2 || '';
            const name = props.name || '';

            const highlight = highlights.find(h =>
                (h.code && h.code.toLowerCase() === iso.toLowerCase()) ||
                (h.mapName && h.mapName.toLowerCase() === name.toLowerCase())
            );

            if (highlight) {
                if (highlight.status === 'full') {
                    return { fillColor: '#22c55e', weight: 1, color: 'white', fillOpacity: 0.8 }; // Green
                } else {
                    return { fillColor: '#eab308', weight: 1, color: 'white', fillOpacity: 0.8 }; // Yellow
                }
            }
            return { fillColor: '#3f3f46', weight: 1, color: '#52525b', fillOpacity: 0.4 }; // Default Dark
        };
    }, [highlights]);

    return (
        <div className="w-full h-full rounded-2xl overflow-hidden border-2 border-[var(--border-color)] relative bg-[var(--surface-color)] shadow-sm z-0">
            {loadingMap && <div className="absolute inset-0 flex items-center justify-center text-[var(--text-secondary)] font-bold">Carregando mapa...</div>}

            {!loadingMap && geoJsonData && (
                <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    minZoom={2}
                    maxZoom={6}
                    style={{ height: '100%', width: '100%', background: 'transparent' }}
                    attributionControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                    />
                    <GeoJSON
                        data={geoJsonData}
                        style={styleFunction}
                    />
                    <MapUpdater highlights={highlights} geoJsonData={geoJsonData} />
                </MapContainer>
            )}
        </div>
    );
}
