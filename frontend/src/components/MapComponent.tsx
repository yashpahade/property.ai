'use client';

import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPrice } from '../lib/utils';
import Link from 'next/link';
import L from 'leaflet';
import { Layers, Globe, Mountain, Map as MapIcon } from 'lucide-react';

interface PoiMarker {
  lat: number;
  lng: number;
  name: string;
  type: string;
  city?: string;
}

const getPoiColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hospital': return '#ef4444'; // Red
    case 'school': return '#3b82f6';   // Blue
    case 'college': return '#6366f1';  // Indigo
    case 'cafe': return '#f97316';     // Orange
    case 'market': return '#eab308';   // Yellow
    case 'gym': return '#10b981';      // Emerald
    case 'metro': return '#8b5cf6';    // Purple
    default: return '#059669';
  }
};

const getPoiEmojiOrLetter = (type: string) => {
  switch (type.toLowerCase()) {
    case 'hospital': return 'H';
    case 'school': return 'S';
    case 'college': return 'C';
    case 'cafe': return 'CF';
    case 'market': return 'M';
    case 'gym': return 'G';
    case 'metro': return 'TR';
    default: return 'P';
  }
};

// Create a custom DivIcon for POIs WITH VISIBLE REAL NAME BADGE
const createPoiDivIcon = (type: string, name: string) => {
  const color = getPoiColor(type);
  const letter = getPoiEmojiOrLetter(type);
  const shortName = name.length > 28 ? name.substring(0, 26) + '...' : name;

  return L.divIcon({
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 5px;
        background: #ffffff;
        padding: 3px 8px 3px 4px;
        border-radius: 20px;
        border: 1.5px solid #cbd5e1;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        cursor: pointer;
        white-space: nowrap;
        pointer-events: auto;
        transform: translate(-10px, -10px);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      ">
        <div style="
          background: ${color};
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 8.5px;
          flex-shrink: 0;
        ">
          ${letter}
        </div>
        <span style="
          font-size: 10.5px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        ">
          ${shortName}
        </span>
      </div>
    `,
    className: 'custom-poi-marker-with-name',
    iconSize: [120, 24],
    iconAnchor: [12, 12],
  });
};

// Create a custom DivIcon for Micro-Markets WITH VISIBLE AREA NAME & RATE TAG
const createCustomMarker = (score: number, localityName: string, rate: number, plotGuntha?: number) => {
  const isHighAlpha = score >= 90;
  const isMediumAlpha = score >= 80;
  const badgeColor = isHighAlpha ? '#059669' : (isMediumAlpha ? '#4f46e5' : '#d97706');
  const shortLocality = (localityName || 'Locality').split(',')[0].trim();
  const rateText = plotGuntha && plotGuntha > 0 
    ? `~₹${(plotGuntha/100000).toFixed(1)}L/G • ₹${rate?.toLocaleString('en-IN')}/sqft` 
    : `₹${rate?.toLocaleString('en-IN')}/sqft`;

  return L.divIcon({
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        padding: 4px 10px 4px 4px;
        border-radius: 24px;
        border: 2px solid ${badgeColor};
        box-shadow: 0 4px 16px rgba(15, 23, 42, 0.22);
        font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
        cursor: pointer;
        white-space: nowrap;
        transform: translate(-16px, -16px);
        transition: transform 0.15s ease;
      ">
        <div style="
          background: ${badgeColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 10px;
          flex-shrink: 0;
        ">
          ${score}
        </div>
        <div style="display: flex; flex-direction: column; line-height: 1.15; text-align: left;">
          <span style="font-size: 11px; font-weight: 800; color: #0f172a;">
            ${shortLocality}
          </span>
          <span style="font-size: 9.5px; font-weight: 700; color: ${badgeColor};">
            ${rateText}
          </span>
        </div>
      </div>
    `,
    className: 'custom-micro-market-marker',
    iconSize: [160, 32],
    iconAnchor: [16, 16],
  });
};

function MapViewUpdater({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
    const timer = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);
  return null;
}

export default function MapComponent({ 
  properties = [], 
  center = [19.0760, 72.8777], 
  zoom = 11,
  poiMarkers = [],
  activePois = ['hospital', 'school', 'college', 'cafe', 'market', 'gym', 'metro']
}: { 
  properties?: any[], 
  center?: [number, number], 
  zoom?: number,
  poiMarkers?: PoiMarker[],
  activePois?: string[]
}) {
  const [mounted, setMounted] = useState(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'topo'>('streets');

  const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || 'get_your_own_OpIi9ZULNHzrESv6T2vL';

  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMounted(true);
  }, []);

  const filteredPois = useMemo(() => {
    return poiMarkers.filter(poi => activePois.includes(poi.type.toLowerCase()));
  }, [poiMarkers, activePois]);

  const tileLayerConfig = useMemo(() => {
    if (mapStyle === 'satellite') {
      return {
        url: `https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=${maptilerApiKey}`,
        fallbackUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      };
    } else if (mapStyle === 'topo') {
      return {
        url: `https://api.maptiler.com/maps/topo-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`,
        fallbackUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      };
    } else {
      return {
        url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerApiKey}`,
        fallbackUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      };
    }
  }, [mapStyle, maptilerApiKey]);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-50 text-slate-400 font-medium text-xs">
        Initializing MapTiler Real Estate Engine...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 1 }}
        zoomControl={false}
      >
        <MapViewUpdater center={center} zoom={zoom} />
        
        {/* MapTiler Tile Layer */}
        <TileLayer
          key={mapStyle}
          url={tileLayerConfig.url}
          attribution={tileLayerConfig.attribution}
          maxZoom={20}
        />

        {/* GENUINE REAL-WORLD POI MARKERS LAYER (WITH DIRECT VISIBLE NAME BADGES) */}
        {filteredPois.map((poi, idx) => {
          const lat = poi.lat;
          const lng = poi.lng;
          if (!lat || !lng) return null;

          return (
            <Marker
              key={`poi-${idx}-${poi.name}`}
              position={[lat, lng]}
              icon={createPoiDivIcon(poi.type, poi.name)}
            >
              <Popup className="custom-popup" maxWidth={280}>
                <div className="p-1 space-y-1.5 text-slate-900 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: getPoiColor(poi.type) }} 
                    />
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">
                      {poi.type}
                    </span>
                  </div>
                  <h4 className="font-black text-xs text-slate-900 leading-tight">
                    {poi.name}
                  </h4>
                  <div className="text-[10px] text-slate-500">
                    City Location: <strong>{poi.city || 'Regional Corridor'}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Real Estate Micro-Markets & Properties (WITH DIRECT VISIBLE AREA NAME & RATES) */}
        {properties.map((prop) => {
          const lat = prop.lat || prop.latitude;
          const lng = prop.lng || prop.longitude;
          if (!lat || !lng) return null;

          const circleRate = prop.circle_rate || prop.ready_reckoner_rate || Math.round((prop.market_rate_avg || prop.price_per_sqft || 10000) * 0.65);
          const marketRate = prop.market_rate_avg || prop.price_per_sqft || (prop.price && prop.area ? Math.round(prop.price / prop.area) : 12000);
          const plotGuntha = prop.plot_rate_guntha || (prop.plot_rate_sqft ? prop.plot_rate_sqft * 1089 : 0);
          const score = prop.ai_score || prop.score || 85;
          const locName = prop.locality || prop.title || 'Micro-Market';

          return (
            <Marker 
              key={prop.id || `prop-${lat}-${lng}`} 
              position={[lat, lng]} 
              icon={createCustomMarker(score, locName, marketRate, plotGuntha)}
            >
              <Popup className="custom-popup" maxWidth={320}>
                <div className="p-1 space-y-2 font-sans text-slate-900">
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {locName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {prop.city}, {prop.state || 'Maharashtra'}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ★ {score} AI Score
                    </span>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Market Rate</div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        ₹{marketRate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/sq.ft</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Circle Rate</div>
                      <div className="font-bold text-indigo-700 text-sm">
                        ₹{circleRate.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/sq.ft</span>
                      </div>
                    </div>
                  </div>

                  {/* Growth & Yield Badges */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                    <span>Rental Yield: <strong className="text-emerald-700">{prop.rental_yield || 4.2}%</strong></span>
                    <span>5-Yr CAGR: <strong className="text-indigo-700">+{prop.cagr_5y || 11.5}%</strong></span>
                  </div>

                  {/* CTA */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2">
                    <Link
                      href={`/search?q=${encodeURIComponent(prop.locality || prop.city)}`}
                      className="flex-1 text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                    >
                      <span>Inspect RAG Govt Report</span>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* MAPTILER BASEMAP STYLE SWITCHER (Top Right) */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-1 rounded-2xl shadow-lg flex items-center gap-1 text-xs font-bold">
        <button
          onClick={() => setMapStyle('streets')}
          className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all ${
            mapStyle === 'streets'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="MapTiler Streets"
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Streets</span>
        </button>

        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all ${
            mapStyle === 'satellite'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="MapTiler Satellite Aerial View"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => setMapStyle('topo')}
          className={`px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all ${
            mapStyle === 'topo'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="MapTiler Topographic Terrain"
        >
          <Mountain className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Terrain</span>
        </button>
      </div>

      {/* Floating Legend (Hidden on Mobile, Visible on Desktop) */}
      <div className="hidden md:block absolute bottom-6 right-6 z-[400] bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-slate-200/80 text-xs space-y-2">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">Map Indicator Key</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] text-white font-bold">90</div>
          <span className="text-slate-600">Micro-Market Score</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#ef4444] text-[8px] text-white font-bold flex items-center justify-center">H</div>
          <span className="text-slate-600">Hospitals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] text-[8px] text-white font-bold flex items-center justify-center">S</div>
          <span className="text-slate-600">Schools & Colleges</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#f97316] text-[8px] text-white font-bold flex items-center justify-center">CF</div>
          <span className="text-slate-600">Cafes & Dining</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6] text-[8px] text-white font-bold flex items-center justify-center">TR</div>
          <span className="text-slate-600">Metro Transit</span>
        </div>
      </div>
    </div>
  );
}