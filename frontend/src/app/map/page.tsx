'use client';

import React, { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Compass, Search, MapPin, Building, Train, Briefcase, 
  Stethoscope, GraduationCap, ShoppingBag, Dumbbell, ShieldCheck, 
  Coffee, Layers, ArrowUpRight, TrendingUp, Sparkles, X, 
  ChevronUp, ChevronDown, Filter, SlidersHorizontal, Eye, List,
  BookOpen, Landmark
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), { ssr: false });

const POI_TYPES = [
  { id: 'hospital', label: 'Hospitals', icon: Stethoscope, color: '#ef4444' },
  { id: 'school', label: 'Schools', icon: GraduationCap, color: '#3b82f6' },
  { id: 'college', label: 'Colleges', icon: BookOpen, color: '#6366f1' },
  { id: 'cafe', label: 'Cafes', icon: Coffee, color: '#d97706' },
  { id: 'market', label: 'Markets & Malls', icon: ShoppingBag, color: '#eab308' },
  { id: 'gym', label: 'Gyms', icon: Dumbbell, color: '#10b981' },
  { id: 'metro', label: 'Metro Stations', icon: Train, color: '#8b5cf6' }
];

const CITY_COORDINATES: Record<string, [number, number]> = {
  'All': [20.5937, 78.9629],
  'Bangalore': [12.9716, 77.5946],
  'Hyderabad': [17.3850, 78.4867],
  'Delhi NCR': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Pune': [18.5204, 73.8567],
  'Nagpur': [21.1458, 79.0882],
  'Chennai': [13.0827, 80.2707],
  'Kolkata': [22.5726, 88.3639],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Goa': [15.2993, 74.1240],
  'Chandigarh': [30.7333, 76.7794],
  'Indore': [22.7196, 75.8577],
  'Kochi': [9.9312, 76.2673],
  'Thane': [19.2183, 72.9781],
  'Navi Mumbai': [19.0330, 73.0297],
  'Gurgaon': [28.4595, 77.0266],
  'Noida': [28.5355, 77.3910]
};

export default function MapPage() {
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [poiMarkers, setPoiMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePois, setActivePois] = useState<string[]>([
    'hospital', 'school', 'college', 'cafe', 'market', 'gym', 'metro'
  ]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedLocality, setSelectedLocality] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState<'map' | 'list'>('map');
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  useEffect(() => {
    async function loadMapData() {
      setLoading(true);
      try {
        const data = await api.getIndiaMapData(selectedCity === 'All' ? '' : selectedCity, 'All');
        const locs = data?.locations || (Array.isArray(data) ? data : []);
        const pois = data?.poi_markers || [];
        setMapLocations(locs);
        setPoiMarkers(pois);
        if (locs.length > 0) {
          setSelectedLocality(locs[0]);
        }
      } catch (err) {
        console.error("Failed to load map data", err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, [selectedCity]);

  const togglePoi = (id: string) => {
    setActivePois(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const filteredLocations = useMemo(() => {
    return mapLocations.filter(loc => {
      if (searchQuery.trim() === '') return true;
      const q = searchQuery.toLowerCase();
      return (
        (loc.locality && loc.locality.toLowerCase().includes(q)) ||
        (loc.city && loc.city.toLowerCase().includes(q)) ||
        (loc.state && loc.state.toLowerCase().includes(q))
      );
    });
  }, [mapLocations, searchQuery]);

  const mapCenter = useMemo(() => {
    if (selectedLocality && (selectedLocality.lat || selectedLocality.latitude) && (selectedLocality.lng || selectedLocality.longitude)) {
      return [selectedLocality.lat || selectedLocality.latitude, selectedLocality.lng || selectedLocality.longitude] as [number, number];
    }
    return CITY_COORDINATES[selectedCity] || [21.1458, 79.0882];
  }, [selectedCity, selectedLocality]);

  const mapZoom = useMemo(() => {
    if (selectedLocality) return 14;
    if (selectedCity === 'All') return 5;
    return 12;
  }, [selectedCity, selectedLocality]);

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 text-slate-900 pt-14 md:pt-16 font-sans overflow-hidden">
      
      {/* 1. TOP RESPONSIVE HEADER BAR */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6 py-2.5 shrink-0 space-y-2 shadow-sm z-20">
        
        {/* Title, Search & Mobile Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                  Pan-India GIS Explorer
                </h1>
                <span className="text-[10px] text-slate-500 font-medium">
                  {filteredLocations.length} Micro-Markets & {poiMarkers.length} Live Amenities Mapped
                </span>
              </div>
            </div>

            {/* Mobile View Toggle (Map vs List) */}
            <div className="flex sm:hidden items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                onClick={() => setMobileTab('map')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mobileTab === 'map' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Eye className="h-3 w-3" />
                <span>Map</span>
              </button>
              <button
                onClick={() => setMobileTab('list')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  mobileTab === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'
                }`}
              >
                <List className="h-3 w-3" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search area, city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Scrollable City Jumper Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-emerald-600" /> City:
          </span>
          {Object.keys(CITY_COORDINATES).map((city) => (
            <button
              key={city}
              onClick={() => {
                setSelectedCity(city);
                setSelectedLocality(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-all border ${
                selectedCity === city
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold active:scale-95'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-400 hover:text-emerald-800'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

      </div>

      {/* 2. MAIN RESPONSIVE CONTAINER */}
      <div className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        
        {/* MAP CANVAS CONTAINER */}
        <div className={`flex-1 relative w-full h-full ${mobileTab === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapComponent 
            properties={filteredLocations}
            poiMarkers={poiMarkers}
            activePois={activePois}
            center={mapCenter}
            zoom={mapZoom}
          />

          {/* Floating POI Overlays Strip */}
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-2xl shadow-lg flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[92vw] sm:max-w-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 shrink-0 flex items-center gap-1">
              <Layers className="h-3 w-3 text-indigo-600" /> Amenities:
            </span>
            {POI_TYPES.map((poi) => {
              const Icon = poi.icon;
              const active = activePois.includes(poi.id);
              return (
                <button
                  key={poi.id}
                  onClick={() => togglePoi(poi.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border shrink-0 ${
                    active 
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-3 w-3" style={{ color: active ? '#4f46e5' : '#94a3b8' }} />
                  <span>{poi.label}</span>
                </button>
              );
            })}
          </div>

          {/* MOBILE INTERACTIVE BOTTOM SHEET (Appears when a locality is selected) */}
          {selectedLocality && (
            <div className={`md:hidden absolute bottom-0 left-0 right-0 z-[500] bg-white border-t border-slate-200 rounded-t-3xl shadow-2xl transition-all duration-300 ${
              bottomSheetExpanded ? 'max-h-[85vh] overflow-y-auto' : 'max-h-56'
            }`}>
              
              {/* Grab Handle */}
              <div 
                onClick={() => setBottomSheetExpanded(!bottomSheetExpanded)}
                className="w-full pt-2 pb-1 flex flex-col items-center justify-center cursor-pointer active:scale-95"
              >
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-1" />
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <span>{bottomSheetExpanded ? 'Collapse' : 'Swipe Up for Details'}</span>
                  {bottomSheetExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </div>
              </div>

              {/* Bottom Sheet Content */}
              <div className="p-4 space-y-3">
                
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                      {selectedLocality.locality || selectedLocality.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {selectedLocality.city}, {selectedLocality.state || 'Maharashtra'}
                    </p>
                  </div>

                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    ★ {selectedLocality.ai_score || 88} AI Score
                  </span>
                </div>

                {/* Price Rate Cards */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Market Rate:</span>
                    <strong className="text-slate-900 font-black text-sm">
                      ₹{(selectedLocality.market_rate_avg || selectedLocality.price_per_sqft || 5800).toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/sq.ft</span>
                    </strong>
                  </div>

                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Plots (Guntha):</span>
                    <strong className="text-emerald-800 font-black text-sm">
                      ~₹{((selectedLocality.plot_rate_guntha || (selectedLocality.plot_rate_sqft || 3500) * 1089) / 100000).toFixed(1)} Lakhs<span className="text-[10px] font-normal">/G</span>
                    </strong>
                  </div>
                </div>

                {/* Expanded Details on Swipe */}
                {bottomSheetExpanded && (
                  <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Ready Reckoner Circle Rate:</span>
                      <strong className="text-indigo-700 font-bold">
                        ₹{(selectedLocality.circle_rate || 3900).toLocaleString('en-IN')}/sq.ft
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>5-Year CAGR Growth:</span>
                      <strong className="text-emerald-700 font-bold">
                        +{selectedLocality.cagr_5y || 12.5}%
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-slate-600">
                      <span>Gross Rental Yield:</span>
                      <strong className="text-slate-900 font-bold">
                        {selectedLocality.rental_yield || 4.2}%
                      </strong>
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href={`/search?q=${encodeURIComponent(selectedLocality.locality || selectedLocality.city)}`}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-center font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <span>Inspect Full Valuation & 7/12 Report</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>

              </div>
            </div>
          )}

        </div>

        {/* DESKTOP SIDEBAR / MOBILE LIST VIEW */}
        <div className={`w-full md:w-96 bg-white border-l border-slate-200 flex flex-col overflow-hidden ${
          mobileTab === 'map' ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
            <div>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Micro-Market Intelligence
              </h2>
              <p className="text-[10px] text-slate-500">
                Click any locality to focus on map & view Ready Reckoner rates
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredLocations.length} Listed
            </span>
          </div>

          {/* Selected Locality Details Card (Desktop) */}
          {selectedLocality && (
            <div className="p-4 bg-emerald-50/40 border-b border-emerald-100 shrink-0 space-y-2.5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                    Active Selection
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    {selectedLocality.locality || selectedLocality.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">{selectedLocality.city}, {selectedLocality.state}</p>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ★ {selectedLocality.ai_score || 88} Score
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Market Rate:</span>
                  <strong className="text-slate-900 font-extrabold">
                    ₹{(selectedLocality.market_rate_avg || selectedLocality.price_per_sqft || 5800).toLocaleString('en-IN')}/sqft
                  </strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Circle Rate:</span>
                  <strong className="text-indigo-700 font-extrabold">
                    ₹{(selectedLocality.circle_rate || 3900).toLocaleString('en-IN')}/sqft
                  </strong>
                </div>
              </div>

              <Link
                href={`/search?q=${encodeURIComponent(selectedLocality.locality || selectedLocality.city)}`}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
              >
                <span>Inspect Full RAG Valuation</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Micro-Markets Scrollable List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredLocations.map((loc, idx) => {
              const isSelected = selectedLocality?.locality === loc.locality;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedLocality(loc);
                    setMobileTab('map');
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 line-clamp-1">{loc.locality}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {loc.city}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 font-bold">
                      ₹{(loc.market_rate_avg || loc.price_per_sqft || 5800).toLocaleString('en-IN')}/sqft
                    </span>
                    <span className="text-slate-500">
                      Circle: ₹{(loc.circle_rate || 3900).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}