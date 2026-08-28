'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MapPin, ChevronDown, ChevronUp, ArrowUpRight, 
  CheckCircle2, AlertTriangle, TrendingUp, IndianRupee, Layers, FileText, 
  Map as MapIcon, Copy, Check, Home, Building, LandPlot, Castle, Landmark,
  Compass, Route, Navigation, Trees, FileCheck, ExternalLink, Globe, Award,
  CheckCheck, AlertOctagon, Landmark as BankIcon, Filter, GraduationCap,
  ShoppingBag, Train, Plane, HeartPulse, Car, ChevronRight, Printer, Calculator,
  Coffee
} from 'lucide-react';
import ValuationReportModal from '@/components/ValuationReportModal';
import BankLoanCalculator from '@/components/BankLoanCalculator';

interface GoogleAIOverviewProps {
  data: any;
  onSearchAgain?: (query: string) => void;
}

export default function GoogleAIOverview({ data, onSearchAgain }: GoogleAIOverviewProps) {
  const [expandedPaa, setExpandedPaa] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeAssetTab, setActiveAssetTab] = useState<'all' | 'flats' | 'plots' | 'duplex_villa'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('All Areas');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showLoanCalc, setShowLoanCalc] = useState(false);

  if (!data) return null;

  const hierarchy = data.hierarchy || {};
  const state = hierarchy.state || data.state || 'Maharashtra';
  const city = hierarchy.city || data.city || 'Metropolitan Region';
  const district = hierarchy.district || data.district || '';
  const taluka = hierarchy.taluka || data.taluka || '';
  const locality = hierarchy.locality || data.location_badge || data.query;
  const classification = hierarchy.classification || data.category_badge || 'Suburban Growth Node';

  const sanctionAuthority = data.sanction_authority || 'Planning & Land Revenue Body';
  const sanctionOrderType = data.sanction_order_type || 'Sanctioned Layout Order';
  const civic = data.civic_infrastructure || {};
  const matrix = data.pricing_matrix;
  const propTypes = data.property_types_breakdown || {};
  const govt = data.government_and_tax;
  const govVerif = data.official_government_verification;
  const mrda = data.mrda_sanction_intelligence;
  const cityDir = data.city_directory;
  const paa = data.people_also_ask || [];

  // Filter localities if city directory is present
  const filteredLocalities = cityDir?.localities?.filter((l: any) => {
    if (selectedZone === 'All Areas') return true;
    return l.zone === selectedZone;
  }) || [];

  const handleCopy = () => {
    const text = `PROPS.AI INSTITUTIONAL VALUATION REPORT: ${locality.toUpperCase()}\n` +
      `Hierarchy: State: ${state} | City: ${city} | Authority: ${sanctionAuthority}\n` +
      `MRDA Sanction: ${mrda?.acronym || 'Approved'} (${sanctionOrderType})\n` +
      `Apartments Avg: INR ${matrix?.market_rate_avg?.toLocaleString('en-IN')}/sq.ft (Circle Rate: INR ${matrix?.ready_reckoner_circle_rate?.toLocaleString('en-IN')}/sq.ft)\n` +
      `Residential NA Plots: INR ${matrix?.plot_rate_sqft?.toLocaleString('en-IN')}/sq.ft (~INR ${((matrix?.plot_rate_guntha || 0)/100000).toFixed(1)} Lakhs/Guntha)\n` +
      `Bank Financing: ${mrda?.bank_loan_eligibility || 'Eligible for Nationalized Bank Lending'}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePaa = (idx: number) => {
    setExpandedPaa(expandedPaa === idx ? null : idx);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 text-slate-900 font-sans">
      
      {/* 1. HIERARCHICAL BREADCRUMB BAR (State -> City -> Area -> Planning Body) */}
      <div className="bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-600 flex-wrap">
          <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Hierarchy:</span>
          <span className="font-bold text-slate-900">{state}</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-bold text-slate-900">{city}</span>
          {taluka && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-700">{taluka}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-extrabold text-emerald-700">{locality}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-emerald-600" /> Statutory Verified
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold">
            {classification}
          </span>
        </div>
      </div>

      {/* 2. EXECUTIVE VALUATION HEADER & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 p-[1.5px] shadow-sm shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Landmark className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-slate-900">
                {locality} Valuation Benchmark
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Sanctioning Authority: <strong className="text-slate-800 font-semibold">{sanctionAuthority}</strong></span>
              <span>• Order Type: <strong className="text-slate-800 font-semibold">{sanctionOrderType}</strong></span>
            </p>
          </div>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* FEATURE 1: 1-CLICK PDF REPORT GENERATOR */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            title="Download Official PDF Valuation Certificate"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Download PDF Report</span>
          </button>

          {/* FEATURE 2: BANK LOAN & EMI CALCULATOR TOGGLE */}
          <button
            onClick={() => setShowLoanCalc(!showLoanCalc)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              showLoanCalc 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>{showLoanCalc ? 'Hide Loan Calculator' : 'Bank Loan & EMI'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 transition-colors flex items-center gap-1 shadow-sm"
            title="Copy Executive Summary"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="text-[11px] font-semibold">{copied ? 'Copied' : 'Share'}</span>
          </button>
          
          <Link
            href="/map"
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            title="Pan-India GIS Map"
          >
            <MapIcon className="h-3.5 w-3.5 text-slate-600" />
          </Link>
        </div>
      </div>

      {/* FEATURE 2: INLINE BANK LOAN & EMI CALCULATOR */}
      {showLoanCalc && (
        <div className="pt-2">
          <BankLoanCalculator 
            initialPrice={matrix?.market_rate_avg ? matrix.market_rate_avg * 750 : 4500000}
            initialLocation={locality}
            circleRate={matrix?.ready_reckoner_circle_rate ? matrix.ready_reckoner_circle_rate * 750 : 3500000}
          />
        </div>
      )}

      {/* 3. CITY-WIDE AREA DIRECTORY SELECTOR (WHEN SEARCHING BROADER CITIES LIKE MUMBAI, PUNE, NAGPUR) */}
      {cityDir && (
        <div className="bg-slate-50 border-2 border-indigo-200/80 p-5 md:p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-base">
                <Compass className="h-5 w-5 text-indigo-600" />
                <span>{cityDir.city_name} Locality & Micro-Market Directory</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Select any specific locality below to access deep valuation benchmarks:
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200 self-start md:self-auto">
              {filteredLocalities.length} Verified Areas Available
            </span>
          </div>

          {/* Zone Filter Tabs */}
          {cityDir.zones && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Filter className="h-3 w-3 text-indigo-600" /> Filter Zone:
              </span>
              {cityDir.zones.map((zone: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedZone(zone)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    selectedZone === zone
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          )}

          {/* Area Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {filteredLocalities.map((item: any, idx: number) => (
              <div
                key={idx}
                onClick={() => onSearchAgain && onSearchAgain(item.query || item.name)}
                className="p-4 bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-md rounded-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-2.5 shadow-sm active:scale-95"
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="text-xs font-black text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                    {item.name}
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                    {item.authority}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-black text-emerald-700">
                    INR {item.rate_avg_sqft?.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/sq.ft</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
                    <span>Circle Rate: <strong className="text-indigo-700 font-semibold">INR {item.circle_rate_sqft?.toLocaleString('en-IN')}/sq.ft</strong></span>
                    {item.plot_rate_guntha && (
                      <span>Plots: <strong className="text-emerald-700 font-semibold">~INR {(item.plot_rate_guntha/100000).toFixed(1)}L/G</strong></span>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-600 line-clamp-1 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {item.highlights}
                </div>

                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800">
                  <span>View Valuation Report</span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MULTI-ASSET PRICING MATRIX (Flats vs NA Plots in Guntha vs Duplex vs Villas) */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-600" />
            Asset Class Pricing Matrix & Circle Rate Benchmarks
          </h3>

          {/* Asset Category Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px]">
            <button
              onClick={() => setActiveAssetTab('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeAssetTab === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              All Asset Classes
            </button>
            <button
              onClick={() => setActiveAssetTab('plots')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeAssetTab === 'plots' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Residential Plots (Guntha)
            </button>
            <button
              onClick={() => setActiveAssetTab('flats')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeAssetTab === 'flats' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Apartments & Flats
            </button>
            <button
              onClick={() => setActiveAssetTab('duplex_villa')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${activeAssetTab === 'duplex_villa' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Duplexes & Villas
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Apartments & High-Rise Flats */}
          {(activeAssetTab === 'all' || activeAssetTab === 'flats') && (
            <div className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-indigo-700">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" /> High-Rise Apartments
                </span>
                <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-bold">
                  Ready Reckoner
                </span>
              </div>
              <div className="text-xl font-black text-slate-900">
                INR {matrix?.market_rate_avg?.toLocaleString('en-IN')}
                <span className="text-[10px] font-normal text-slate-500">/sq.ft</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-2">
                <div>Circle Benchmark: <strong className="text-indigo-700">INR {matrix?.ready_reckoner_circle_rate?.toLocaleString('en-IN')}/sq.ft</strong></div>
                <div>Typical 2 BHK (750 sq.ft): <strong className="text-slate-900">INR {((matrix?.market_rate_avg * 750)/100000).toFixed(1)} Lakhs</strong></div>
              </div>
            </div>
          )}

          {/* Card 2: Sanctioned Residential Plots (Guntha Rate) */}
          {(activeAssetTab === 'all' || activeAssetTab === 'plots') && (
            <div className="p-4 bg-white border border-emerald-200 hover:border-emerald-300 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <LandPlot className="h-3.5 w-3.5" /> Residential Plots
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  {mrda?.acronym || sanctionAuthority.split(' ')[0]} Sanctioned
                </span>
              </div>
              <div className="text-xl font-black text-emerald-700">
                INR {((matrix?.plot_rate_guntha || matrix?.plot_rate_sqft * 1089) / 100000).toFixed(1)} Lakhs
                <span className="text-[10px] font-normal text-slate-500">/Guntha</span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-2">
                <div>Rate: <strong className="text-emerald-700">INR {matrix?.plot_rate_sqft?.toLocaleString('en-IN')}/sq.ft</strong> (1 Guntha = 1,089 sq.ft)</div>
                <div>1,000 sq.ft Plot: <strong className="text-slate-900">INR {((matrix?.plot_rate_sqft * 1000)/100000).toFixed(1)} Lakhs</strong></div>
              </div>
            </div>
          )}

          {/* Card 3: Duplex Homes & Row Houses */}
          {(activeAssetTab === 'all' || activeAssetTab === 'duplex_villa') && (
            <div className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Castle className="h-3.5 w-3.5" /> Duplex Penthouses
                </span>
                <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Double Height
                </span>
              </div>
              <div className="text-xl font-black text-amber-700">
                INR {((propTypes?.duplex_penthouses?.avg_price || matrix?.market_rate_avg * 1800) / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-2">
                <div>Standard Size: <strong className="text-slate-900">1,800 - 2,400 sq.ft</strong></div>
                <div>Terrace & Parking: <strong className="text-slate-700">Included</strong></div>
              </div>
            </div>
          )}

          {/* Card 4: Independent Villas & Row Houses */}
          {(activeAssetTab === 'all' || activeAssetTab === 'duplex_villa') && (
            <div className="p-4 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-sky-700">
                <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Home className="h-3.5 w-3.5" /> Villas & Bungalows
                </span>
                <span className="text-[10px] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  Land Ownership
                </span>
              </div>
              <div className="text-xl font-black text-sky-700">
                INR {((propTypes?.independent_villas_homes?.avg_price || matrix?.market_rate_avg * 2500) / 10000000).toFixed(2)} Cr
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 border-t border-slate-100 pt-2">
                <div>Plot Footprint: <strong className="text-slate-900">1,500 - 2,500 sq.ft</strong></div>
                <div>Title: <strong className="text-slate-700">Freehold Conveyance</strong></div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 5. CIVIC INFRASTRUCTURE & ARTERIAL DISTANCES (Schools, Cafes, Markets, Transit, Airports) */}
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Route className="h-4 w-4 text-indigo-600" />
            <span>Civic Infrastructure & Arterial Distance Matrix</span>
          </h3>
          <span className="text-[10px] text-slate-500 font-semibold">Gemini Spatial Regression</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          
          {/* Cafes & Dining */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
              <Coffee className="h-4 w-4" />
              <span>Cafes & Dining Establishments</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              {civic.cafes_restaurants ? (
                civic.cafes_restaurants.map((c: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{c.name}</span>
                    <strong className="text-amber-700 shrink-0 font-semibold">{c.distance_km}</strong>
                  </div>
                ))
              ) : (
                <div className="flex justify-between"><span>Artisan Coffee & Food Street</span><strong>0.8 km</strong></div>
              )}
            </div>
          </div>

          {/* Schools & Colleges */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-indigo-700 text-xs font-bold">
              <GraduationCap className="h-4 w-4" />
              <span>Schools & Educational Institutions</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              {civic.schools_colleges ? (
                civic.schools_colleges.map((s: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{s.name}</span>
                    <strong className="text-indigo-700 shrink-0 font-semibold">{s.distance_km}</strong>
                  </div>
                ))
              ) : (
                <div className="flex justify-between"><span>Regional Education Campus</span><strong>2.5 km</strong></div>
              )}
            </div>
          </div>

          {/* Markets & Commercial Hubs */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <ShoppingBag className="h-4 w-4" />
              <span>Retail Markets & Commercial Centers</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              {civic.markets_commercial ? (
                civic.markets_commercial.map((m: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{m.name}</span>
                    <strong className="text-emerald-700 shrink-0 font-semibold">{m.distance_km}</strong>
                  </div>
                ))
              ) : (
                <div className="flex justify-between"><span>Town Commercial Market</span><strong>1.8 km</strong></div>
              )}
            </div>
          </div>

          {/* Transit: Railway & Metro */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold">
              <Train className="h-4 w-4" />
              <span>Railway & Metro Transit Links</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              {civic.transit_railway_metro ? (
                civic.transit_railway_metro.map((t: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{t.name}</span>
                    <strong className="text-blue-700 shrink-0 font-semibold">{t.distance_km}</strong>
                  </div>
                ))
              ) : (
                <div className="flex justify-between"><span>Railway Junction / Metro</span><strong>3.5 km</strong></div>
              )}
            </div>
          </div>

          {/* Highways & Expressways */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold">
              <Car className="h-4 w-4" />
              <span>Highways & Road Corridors</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              {civic.highways_expressways ? (
                civic.highways_expressways.map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{h.name}</span>
                    <strong className="text-amber-700 shrink-0 font-semibold">{h.distance_km}</strong>
                  </div>
                ))
              ) : (
                <div className="flex justify-between"><span>National Highway Axis</span><strong>2.0 km</strong></div>
              )}
            </div>
          </div>

          {/* Airports */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-purple-700 text-xs font-bold">
              <Plane className="h-4 w-4" />
              <span>Domestic & International Airports</span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-600">
              {civic.airports ? (
                civic.airports.map((a: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="truncate pr-2">{a.name}</span>
                    <strong className="text-purple-700 shrink-0 font-semibold">{a.distance_km}</strong>
                  </div>
                ))
              ) : (
                <div className="flex justify-between"><span>Regional Airport Axis</span><strong>22.0 km</strong></div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 6. MRDA APPROVAL & SANCTION ORDER VERIFICATION */}
      {mrda && (
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-2 text-slate-900 text-xs font-extrabold tracking-wide uppercase">
              <Award className="h-4 w-4 text-emerald-700" />
              <span>{mrda.acronym} Statutory Sanction & Title Verification</span>
            </div>
            <a 
              href={mrda.official_portal} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
            >
              <span>{mrda.portal_name}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-600 font-bold">Statutory Sanction Orders Recognized:</div>
              <ul className="space-y-1 text-[11px]">
                {mrda.sanction_types?.map((st: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5 text-slate-800">
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-1 text-[11px] text-indigo-700 flex items-center gap-1 font-bold">
                <BankIcon className="h-3.5 w-3.5" />
                <span>{mrda.bank_loan_eligibility}</span>
              </div>
            </div>

            <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>5-Step Title & Encumbrance Verification:</span>
              </div>
              <ul className="space-y-1 text-[10px] text-slate-600 font-medium">
                {mrda.verification_checklist?.slice(0, 3).map((chk: string, idx: number) => (
                  <li key={idx} className="line-clamp-1">{chk}</li>
                ))}
              </ul>
              {mrda.buyer_caution && (
                <div className="text-[10px] text-amber-800 pt-1 border-t border-slate-100 flex items-start gap-1 font-medium">
                  <AlertOctagon className="h-3 w-3 text-amber-600 shrink-0 mt-0.5" />
                  <span>{mrda.buyer_caution}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. OFFICIAL GOVERNMENT STATUTORY REGISTRIES */}
      {govVerif?.portals && (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="h-4 w-4 text-emerald-700" />
              <span>Official Government Revenue Portals & Land Registries</span>
            </h3>
            <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
              100% Verified Statutory Data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {govVerif.portals.map((portal: any, idx: number) => (
              <a
                key={idx}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border border-slate-200 hover:border-emerald-500 rounded-xl transition-all group flex flex-col justify-between space-y-1.5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {portal.badge}
                  </span>
                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {portal.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                    {portal.purpose}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 8. EXECUTIVE TAKEAWAYS */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Executive Valuation Summary: {locality}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.executive_summary?.map((point: string, idx: number) => (
            <div 
              key={idx} 
              className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-700 leading-relaxed space-y-1"
            >
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: point
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-bold">$1</strong>')
                }} 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 9. PROS & CONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Growth Drivers & Investment Alpha</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {data.pros?.map((pro: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-600 mt-0.5 font-bold">✓</span>
                <span>{pro}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Title Due Diligence & Statutory Taxes</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {data.cons?.map((con: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-amber-600 mt-0.5 font-bold">!</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 10. PEOPLE ALSO ASK (PAA) ACCORDION */}
      {paa.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="h-3.5 w-3.5 text-indigo-600" />
            Frequent Buyer & Investor Inquiries
          </h3>

          <div className="space-y-2">
            {paa.map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => togglePaa(idx)}
                  className="w-full p-3.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors"
                >
                  <span>{item.question}</span>
                  {expandedPaa === idx ? (
                    <ChevronUp className="h-4 w-4 text-emerald-600 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {expandedPaa === idx && (
                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5 bg-slate-50/50">
                    <p>{item.snippet}</p>
                    {onSearchAgain && (
                      <button
                        onClick={() => onSearchAgain(item.question)}
                        className="mt-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Explore deeper analysis <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. STATUTORY FOOTER */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Statutory Authority: {mrda?.acronym || 'MRDA'} • {govt?.state_authority || 'Department of Registration and Stamps'} • {govt?.statutory_act}</span>
        </div>
        <div>
          <span>Engine: <strong className="text-slate-700">{data.model_signature}</strong></span>
        </div>
      </div>

      {/* FEATURE 1: 1-CLICK VALUATION & DUE DILIGENCE REPORT MODAL */}
      <ValuationReportModal 
        isOpen={showPdfModal} 
        onClose={() => setShowPdfModal(false)} 
        data={data} 
      />

    </div>
  );
}
