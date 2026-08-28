'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import GoogleAIOverview from '@/components/GoogleAIOverview';
import BankLoanCalculator from '@/components/BankLoanCalculator';
import { 
  Search, MapPin, Building, Home, TrendingUp, Star, LayoutGrid, CheckCircle,
  FileText, ShieldCheck, Calculator, ArrowUpRight, Sparkles, AlertCircle,
  Clock, IndianRupee, Layers, ExternalLink, Map as MapIcon, ChevronRight,
  Compass, Award, RefreshCw, X, Landmark, BadgePercent
} from 'lucide-react';

const QUICK_SEARCH_CHIPS = [
  { label: 'Besa, Nagpur (Plots)', q: 'Besa Pipla Plots Nagpur' },
  { label: 'Hinjewadi, Pune (PMRDA)', q: 'Hinjewadi Marunji PMRDA Plots Pune' },
  { label: 'Waki Village, Pune', q: 'Waki village near Pune' },
  { label: 'Wardha Road MIHAN', q: 'Wardha Road MIHAN Nagpur' },
  { label: 'Sawantwadi, Sindhudurg', q: 'Sawantwadi Sindhudurg' },
  { label: 'Bandra West, Mumbai', q: 'Bandra West Mumbai' },
  { label: 'Alibaug Coastal NA', q: 'Alibaug Coastal NA Plots & Villas' },
  { label: 'Whitefield, Bangalore', q: 'Whitefield Bangalore' },
  { label: 'Tellapur, Hyderabad', q: 'Tellapur Hyderabad plots' }
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || 'Besa Pipla Plots Nagpur';

  const [query, setQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'ai_overview' | 'loan_calc' | 'calculator' | 'listings'>('ai_overview');
  const [aiOverviewData, setAiOverviewData] = useState<any>(null);
  const [ragData, setRagData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);

  // Custom Calculator state
  const [customArea, setCustomArea] = useState<number>(1000);
  const [customBhk, setCustomBhk] = useState<number>(2);

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);

    try {
      const [aiOverview, ragResult, propResult] = await Promise.all([
        api.getGoogleAIOverview(searchTerm, customArea, customBhk),
        api.searchRAG(searchTerm, customArea, customBhk),
        api.getProperties({ q: searchTerm })
      ]);
      setAiOverviewData(aiOverview);
      setRagData(ragResult);
      setProperties(propResult || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      executeSearch(searchInput.trim());
    }
  };

  const handleChipClick = (q: string) => {
    setSearchInput(q);
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
    executeSearch(q);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pt-16 md:pt-20 font-sans">
      
      {/* 1. TOP SEARCH & CHIPS BAR */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-slate-200 px-3 sm:px-6 py-4 sticky top-14 md:top-16 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto space-y-3">
          
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </div>

              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search any Village, Plot, Town, Flat or City across India..."
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl md:rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner font-medium"
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-4 sm:px-5 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl md:rounded-2xl transition-all shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Search Valuation</span>
              <span className="sm:hidden">Go</span>
            </button>
          </form>

          {/* Horizontal Swipeable Chips (No Emojis) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="h-3 w-3 text-emerald-600" /> Quick Search:
            </span>
            {QUICK_SEARCH_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.q)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-[11px] font-semibold text-slate-700 transition-all whitespace-nowrap active:scale-95 shrink-0 shadow-sm"
              >
                {chip.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* 2. SUB-NAV TABS & SUMMARY CONTROLS */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 w-full pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('ai_overview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'ai_overview'
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Government & MRDA Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('loan_calc')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'loan_calc'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Landmark className="h-3.5 w-3.5 text-indigo-600" />
              <span>Bank Loan & EMI (SBI/HDFC)</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'calculator'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="h-3.5 w-3.5 text-indigo-600" />
              <span>Custom Area Outlay</span>
            </button>

            <button
              onClick={() => setActiveTab('listings')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'listings'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="h-3.5 w-3.5 text-amber-600" />
              <span>Verified Inventory ({properties.length})</span>
            </button>
          </div>

          {/* Quick Refresh / Map Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => executeSearch(query)}
              className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors shadow-sm"
              title="Refresh Valuation"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
            <Link
              href="/map"
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
            >
              <MapIcon className="h-3.5 w-3.5 text-emerald-600" />
              <span>Map View</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 w-full py-4 space-y-6">
        
        {/* Shimmer Skeleton Loader */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-white rounded-3xl border border-slate-200 shadow-sm" />
            <div className="h-64 bg-white rounded-3xl border border-slate-200 shadow-sm" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-32 bg-white rounded-2xl border border-slate-200 shadow-sm" />
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: AI Overview (Government Verified & MRDA Approved + PDF Report Export) */}
        {!loading && activeTab === 'ai_overview' && aiOverviewData && (
          <GoogleAIOverview 
            data={aiOverviewData} 
            onSearchAgain={(newQ) => handleChipClick(newQ)}
          />
        )}

        {/* Tab 2: Bank Loan & EMI Affordability Calculator */}
        {!loading && activeTab === 'loan_calc' && (
          <BankLoanCalculator 
            initialPrice={aiOverviewData?.pricing_matrix?.market_rate_avg ? aiOverviewData.pricing_matrix.market_rate_avg * 750 : 4500000}
            initialLocation={query}
            circleRate={aiOverviewData?.pricing_matrix?.ready_reckoner_circle_rate ? aiOverviewData.pricing_matrix.ready_reckoner_circle_rate * 750 : 3500000}
          />
        )}

        {/* Tab 3: Custom Area Calculator */}
        {!loading && activeTab === 'calculator' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Custom Property Valuation & Stamp Duty Calculator</h2>
                <p className="text-xs text-slate-500">Calculate total acquisition outlay based on carpet area (sq.ft) and configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Carpet Area (sq.ft):</label>
                  <input
                    type="number"
                    value={customArea}
                    onChange={(e) => setCustomArea(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:bg-white rounded-xl text-slate-900 outline-none focus:border-indigo-500 text-sm font-semibold"
                  />
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {[650, 1000, 1250, 1800, 2400].map((area) => (
                      <button
                        key={area}
                        onClick={() => setCustomArea(area)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-semibold ${
                          customArea === area ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {area} sqft
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">Configuration (BHK):</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((bhk) => (
                      <button
                        key={bhk}
                        onClick={() => setCustomBhk(bhk)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          customBhk === bhk ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {bhk} BHK
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => executeSearch(query)}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20"
                >
                  Recalculate for {query}
                </button>
              </div>

              {/* Outputs */}
              {aiOverviewData?.pricing_matrix && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                    Estimated Outlay for {customArea} sq.ft in {query}:
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Market Rate Valuation:</span>
                      <strong className="text-slate-900">INR {(aiOverviewData.pricing_matrix.market_rate_avg * customArea).toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Ready Reckoner Benchmark:</span>
                      <strong className="text-indigo-700">INR {(aiOverviewData.pricing_matrix.ready_reckoner_circle_rate * customArea).toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between items-center text-sm border-b border-slate-200 pb-2">
                      <span className="text-slate-600">Stamp Duty (6%):</span>
                      <strong className="text-slate-900">INR {((aiOverviewData.pricing_matrix.market_rate_avg * customArea) * 0.06).toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="flex justify-between items-center text-sm pt-1">
                      <span className="text-slate-800 font-bold">Total Estimated Outlay:</span>
                      <strong className="text-emerald-700 text-base font-black">
                        INR {(((aiOverviewData.pricing_matrix.market_rate_avg * customArea) * 1.06) + 30000).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Local Property Listings */}
        {!loading && activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Verified Inventory Matching "{query}"</h2>
              <span className="text-xs text-slate-500">{properties.length} properties found</span>
            </div>

            {properties.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2 shadow-sm">
                <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                <div className="text-sm font-bold text-slate-800">No direct inventory listings found</div>
                <p className="text-xs text-slate-500">Check the Government & MRDA Overview tab for full circle rate and market pricing analysis.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((prop, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-4 space-y-3 transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {prop.property_type || 'Residential'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{prop.price ? formatPrice(prop.price) : 'Price on Request'}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{prop.title || prop.name || query}</h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{prop.locality || prop.location}, {prop.city}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex justify-between">
                      <span>{prop.bhk ? `${prop.bhk} BHK` : 'NA Plot'} • {prop.carpet_area_sqft || prop.area_sqft || '1000'} sq.ft</span>
                      <span className="text-emerald-700 font-semibold">Verified</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
        Loading Government Real Estate Intelligence...
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}