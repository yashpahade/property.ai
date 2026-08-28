'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, MapPin, TrendingUp, ShieldCheck, Sparkles, Building2, 
  LandPlot, Castle, Landmark, Award, ChevronRight, Compass, 
  CheckCircle2, ArrowUpRight, MessageSquare, IndianRupee, Layers, 
  FileCheck, Shield, HelpCircle, BarChart3, Globe, Activity
} from 'lucide-react';

const POPULAR_LOCATIONS = [
  { name: 'Besa, Nagpur', query: 'Besa Nagpur NA plots', tag: 'NMRDA RL Approved', rate: 'INR 41.4L / Guntha', type: 'Residential Plots' },
  { name: 'Hinjewadi, Pune', query: 'Hinjewadi Pune 2 BHK', tag: 'PMRDA Sanctioned', rate: 'INR 6,800 / sq.ft', type: 'Apartments' },
  { name: 'Bandra West, Mumbai', query: 'Bandra West Mumbai', tag: 'MMRDA / BMC', rate: 'INR 72,000 / sq.ft', type: 'Luxury High-Rise' },
  { name: 'Wardha Road, Nagpur', query: 'Wardha Road MIHAN Nagpur', tag: 'MIHAN Metro Corridor', rate: 'INR 38.5L / Guntha', type: 'Residential Plots' },
  { name: 'Wakad, Pune', query: 'Wakad Pune residential', tag: 'PMRDA / PCMC', rate: 'INR 8,200 / sq.ft', type: 'Apartments' },
  { name: 'Whitefield, Bangalore', query: 'Whitefield Bangalore IT Corridor', tag: 'BDA / BMRDA', rate: 'INR 8,500 / sq.ft', type: 'Apartments' },
  { name: 'Sector 150, Noida', query: 'Sector 150 Noida Expressway', tag: 'YEIDA / Sports City', rate: 'INR 9,200 / sq.ft', type: 'Apartments' },
  { name: 'Tellapur, Hyderabad', query: 'Tellapur Hyderabad HMDA', tag: 'HMDA Gated', rate: 'INR 35.0L / Guntha', type: 'Residential Plots' },
];

const USER_INTENT_CARDS = [
  {
    title: 'Plot & Land Valuation',
    subtitle: 'Residential NA plot rates calculated in Guntha (1 Guntha = 1,089 sq.ft) & sq.ft',
    icon: LandPlot,
    color: 'bg-emerald-50/70 border-emerald-200 text-emerald-700',
    iconBg: 'bg-emerald-100 text-emerald-700',
    query: 'residential NA plots guntha rate',
    badge: '1 Guntha = 1,089 sq.ft'
  },
  {
    title: 'Apartment & Flat Rates',
    subtitle: '1, 2, 3, 4 BHK market pricing & Ready Reckoner circle rates',
    icon: Building2,
    color: 'bg-indigo-50/70 border-indigo-200 text-indigo-700',
    iconBg: 'bg-indigo-100 text-indigo-700',
    query: '2 BHK flat price ready reckoner',
    badge: 'Circle Rates'
  },
  {
    title: 'MRDA / Statutory Sanctions',
    subtitle: 'Verify Release Letter (RL), bank loan eligibility & 7/12 land records',
    icon: Award,
    color: 'bg-amber-50/70 border-amber-200 text-amber-800',
    iconBg: 'bg-amber-100 text-amber-700',
    query: 'NMRDA RL approved layout Nagpur',
    badge: 'Bank Loan Eligible'
  },
  {
    title: 'AI Real Estate Advisor',
    subtitle: 'Institutional conversational valuation & legal advisory engine',
    icon: MessageSquare,
    color: 'bg-purple-50/70 border-purple-200 text-purple-700',
    iconBg: 'bg-purple-100 text-purple-700',
    link: '/advisor',
    badge: 'Google Gemini 3.5'
  }
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleChipClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 1. HERO SECTION (Executive Typography, Clean SaaS Theme) */}
      <section className="relative pt-20 md:pt-28 pb-10 md:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 md:w-[600px] h-72 md:h-96 bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6 relative z-10">
          
          {/* Trust Seal Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Government Verified Valuation • e-ASR Ready Reckoner & MRDA RL Sanction</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            Institutional Real Estate Intelligence <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              & Benchmark Pricing Across India
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Instant valuation benchmarks, Ready Reckoner circle rates, MRDA sanctions, Guntha plot rates, and arterial civic distances powered by Google Gemini AI & official state land registries.
          </p>

          {/* MAIN SEARCH BAR */}
          <form onSubmit={handleSearch} className="pt-2 md:pt-4">
            <div className="relative max-w-2xl mx-auto">
              <div className="p-2 sm:p-2.5 bg-white border-2 border-slate-200/90 hover:border-emerald-500/70 focus-within:border-emerald-600 rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/60 transition-all flex items-center gap-2">
                <div className="pl-2 sm:pl-3 text-emerald-600 shrink-0">
                  <Search className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search any Village, Plot, Town, Flat or City (e.g. Besa Nagpur, Hinjewadi Pune)..."
                  className="w-full bg-transparent text-sm md:text-base text-slate-900 placeholder:text-slate-400 outline-none px-1 font-medium"
                />

                <button
                  type="submit"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl md:rounded-2xl transition-all shadow-md shadow-emerald-600/20 shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Check Valuation</span>
                </button>
              </div>
            </div>
          </form>

          {/* SWIPEABLE 1-TAP QUICK CHIPS (NO EMOJIS) */}
          <div className="pt-2 flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Compass className="h-3 w-3 text-emerald-600" /> Popular:
            </span>
            {[
              { label: 'Besa, Nagpur (Plots)', query: 'Besa Nagpur NA plots' },
              { label: 'Hinjewadi, Pune (Flats)', query: 'Hinjewadi Pune 2 BHK' },
              { label: 'Bandra West, Mumbai', query: 'Bandra West Mumbai' },
              { label: 'Wardha Road MIHAN', query: 'Wardha Road MIHAN Nagpur' },
              { label: 'Whitefield, Bangalore', query: 'Whitefield Bangalore' },
              { label: 'Tellapur, Hyderabad', query: 'Tellapur Hyderabad plots' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.query)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-[11px] font-semibold text-slate-700 transition-all whitespace-nowrap active:scale-95 shrink-0 shadow-sm"
              >
                {chip.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. USER INTENT DISCOVERY CARDS */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Select Valuation Objective</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              1-Click access to statutory circle rates, layout sanction orders, and land pricing
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
          {USER_INTENT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                onClick={() => card.link ? router.push(card.link) : handleChipClick(card.query)}
                className={`p-4 md:p-5 rounded-2xl md:rounded-3xl border ${card.color} hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group shadow-sm hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-2xl ${card.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-sm">
                    {card.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm md:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {card.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                  <span>Explore Analysis</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TRENDING MICRO-MARKETS */}
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <span>Trending Micro-Markets & Live Rates</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Live Ready Reckoner and market rates across Indian growth corridors
            </p>
          </div>

          <Link
            href="/search"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View all 70+ locations</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {POPULAR_LOCATIONS.map((loc, idx) => (
            <div
              key={idx}
              onClick={() => handleChipClick(loc.query)}
              className="p-4 bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl transition-all cursor-pointer group active:scale-95 space-y-2.5 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {loc.tag}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">{loc.type}</span>
              </div>

              <div>
                <div className="text-sm font-bold text-slate-800 group-hover:text-slate-950 transition-colors truncate">
                  {loc.name}
                </div>
                <div className="text-base font-black text-emerald-700 mt-0.5">
                  {loc.rate}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-emerald-700">
                <span>View Full Breakdown</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. OFFICIAL STATUTORY TRUST BANNER */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mb-10">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 p-6 md:p-8 rounded-3xl space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Statutory Compliance & Legal Due Diligence Guarantee</span>
              </div>
              <h3 className="text-base md:text-xl font-bold text-slate-900">
                Official Revenue Records, e-ASR Schedules & MRDA Sanction Verification
              </h3>
              <p className="text-xs md:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Props.ai directly correlates valuations with State IGR e-ASR (Annual Statement of Rates), Mahabhulekh Digital 7/12 land records, NMRDA/PMRDA/MMRDA sanction orders, and RERA project disclosures.
              </p>
            </div>

            <Link
              href="/advisor"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0 flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Talk to AI Advisor</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}